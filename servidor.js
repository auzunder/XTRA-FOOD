const session = require('express-session');
const express = require('express');
const fs = require('fs');
const mysql = require("mysql2");
const sha = require('sha1');

const fileUpload = require("express-fileupload");

const servidor = express();
var porta = 8080;

servidor.use(express.urlencoded({extended: true}));
servidor.use(express.static("public"));
servidor.use(fileUpload());
//  Sessão
servidor.use(session({
    secret: "supercalifragilisticexpialidocious",
    resave: false,
    saveUninitialized: true
}));

// Ligação ao servidor
var porta = 8080;
servidor.listen(porta, function () {
    console.log("servidor a ser executado em http://localhost:" + porta);
});

// MySQL user - database
var pool = mysql.createPool({
    host: "localhost",
    user: "xtra_food",
    password: "xtra_food",
    database: "xtra_food",
    charset: "utf8",
    multipleStatements: true
});


//LOG SYSTEM
const logging = (req, res, next) => {
    console.log('================================================================================================================================================');
    console.log("Date: ", Date());
    console.log("Path: ", req.session);
    console.log('================================================================================================================================================');
    next();
};

// Tentar abrir fichieros prinicipais
    try {
        var navbar = fs.readFileSync('html/NavBar.html', 'utf-8');
        var registo_login_popUp = fs.readFileSync('html/registo_login.html', 'utf-8');
        var footer = fs.readFileSync('html/Footer.html', 'utf-8');
       // var err_404 = fs.readFileSync('','utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

// GUARDAR FORM NEWSLETTER 
servidor.post("/processa_newsletter", logging, function (req, res) {
    var query = '';

    query += 'INSERT INTO newsletter(email) VALUES("' + req.body.email + '");';
    pool.query(query, function (err, result, fields) {
        if (!err) {
            res.redirect('back')
        }
        else {
            console.log(err)
            console.log('Erro ao executar pedido ao servidor')
            res.redirect('/internal_error')
        }
    });

});

// GUARDAR FORM REGISTO
servidor.post("/processa_registo", logging, function (req, res) {
    var query = '';
    if (req.body.num_tel){
        query += 'INSERT INTO cliente (nome, email, password, num_tel) VALUES ("' + req.body.nome + '", "' + req.body.email + '", "' + sha(req.body.password) + '", "' + req.body.num_tel + '");';
    }else{
        query += 'INSERT INTO cliente (nome, email, password) VALUES ("' + req.body.nome + '", "' + req.body.email + '", "' + sha(req.body.password) + '");';
    }
    console.log(query);

    pool.query(query, function (err, result, fields) {
        if (!err) {
            req.session.login_ = true
            res.redirect('back')
        }
        else {
            console.log(err)
            console.log('Erro ao executar pedido ao servidor')
            res.redirect('/internal_error')
        }
    });
});

// PROCESSAR LOGIN 
servidor.post("/processa_login", logging, function (req, res) {
    var query = '';
    query += 'SELECT idCliente, nome, email, password FROM cliente WHERE email = "' + req.body.email + '" AND password = "' + sha(req.body.password) + '";';

    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                console.log(result)
                req.session.login_ = null
                req.session.idCliente = result[0].idCliente
                return res.redirect('back')
            }else{
                console.log('Sem resultados SQL')
                return res.redirect('/internal_error')
            }
        }
        else {
            console.log(err)
            console.log('Erro ao executar pedido ao servidor')
            return res.redirect('/internal_error')
        }
    });
});

// LOG OUT
servidor.get("/log_out", logging, function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            return res.redirect('/internal_error')
        }else{
            return res.redirect('/');
        };
    });
});

// PAGINA INICIAL
servidor.get("/", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var home_content = fs.readFileSync('html/home.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }
    
    var html = "";
    
    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">\n';
    html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js">\n</script>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/home_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';
    
    
    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }
    
    //HTML Content
    html += home_content;

    var query ='';
    query += 'SELECT cartaz_img FROM evento ORDER BY data asc;';
    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                //console.log(result)
                html += '\n<script>';
                for (var index in result){
                    html += 'document.getElementById("cartaz_' + (parseInt(index)+1).toString() + '").src = "images/eventos/' + (parseInt(index)+1).toString() + '.jpg";\n';
                    if (index > 1){
                        break;
                    }
                }
                html += '\n</script>\n';
            }else {
                console.log('Não foi possível obter resultados')
            };
        }
        else {
            console.log(err)
            console.log('Erro ao executar pedido ao servidor')
        }
        html += footer;
        html += '</body>\n</html>';
        res.send(html);
    });
});

// PAGINA VOLUNTARIADO
servidor.get("/voluntariado", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/voluntariado.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Voluntariado | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/voluntariado_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

servidor.get("/voluntariado/submissao", logging, function (req, res) {
});

// PAGINA DOAÇÃO
servidor.get("/doacao", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/doacao.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Doação | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/doacao_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA SOBRE NÓS
servidor.get("/sobre_nos", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/sobre_nos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Sobre Nós | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/sobre_nos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA SERVIÇOS
servidor.get("/parceiros", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/servicos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Serviços | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/servicos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA EVENTOS
servidor.get("/eventos", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/eventos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/eventos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA LOJA
servidor.get("/loja", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/loja.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/loja_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA PRODUTO LOJA
servidor.get("/loja/produto/ultrafood", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/produto.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// CARRINHO
servidor.get("/loja/carrinho", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_produtos.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// CARRINHO
servidor.get("/loja/carrinho/informacao", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_informação.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// CARRINHO
servidor.get("/loja/carrinho/finalizacao", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_finalização.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// USER ACCOUNT
servidor.get("/user", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/user_info.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8');
        var footer = fs.readFileSync('html/Footer Loja.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.");
        return res.status(500).send('CODE 500 ERROR: '+ error);
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Conta | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>';
        html += '</div></div></header>';

        //HTML Content
        html += content;

        var query ='';
        query += 'SELECT idCliente, nome, email, num_tel, morada, codigo_postal, distrito FROM cliente WHERE idCliente = ' + req.session.idCliente + ';';
        pool.query(query, function (err, result, fields) {
            if (!err) {
                if (result && result.length > 0) {
                    //console.log(result)
                    html += '\n<script>';
                    html += 'document.getElementById("welcome_nome").innerHTML = "Olá ' + result[0].nome + '!";\n';
                    html += 'document.getElementById("profile_pic").src = "images/profile_pic/' + result[0].idCliente + '.jpg";\n';
                    html += 'document.getElementById("nome").value = "' + result[0].nome + '";\n';
                    html += 'document.getElementById("email").value = "' + result[0].email + '";\n';
                    html += 'document.getElementById("num_tel").value = "' + result[0].num_tel + '";\n';
                    if (result[0].morada){
                        html += 'document.getElementById("linha_endereço").value = "' + result[0].morada + '";\n';
                    };
                    if(result[0].codigo_postal){
                        html += 'document.getElementById("cod_postal_1").value = "' + ((result[0].codigo_postal).split('-'))[0] + '";\n';
                        html += 'document.getElementById("cod_postal_2").value = "' + ((result[0].codigo_postal).split('-'))[1] + '";\n';
                    };
                    if(result[0].distrito){
                        html += 'document.getElementById("distrito").value = "' + result[0].distrito + '";\n';
                    };
                    
                    html += '\n</script>\n';
                }else {
                    console.log('Não foi possível obter resultados')
                };
            }
            else {
                console.log(err)
                console.log('Erro ao executar pedido ao servidor')
            }
            html += footer;
            html += '</body>\n</html>';
            return res.send(html);
        });
    }else{
        return res.status(403).redirect('/login_error');
    };
});

// USER ACCOUNT
servidor.get("/user/history", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/user_history.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

   if (req.session.idCliente){
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>';
        html += '</div></div></header>';

        //HTML Content
        html += content;

        var query ='';
        query += 'SELECT idCliente, nome FROM cliente WHERE idCliente = ' + req.session.idCliente + ';';
        query += 'SELECT idProduto, idEncomenda, data, nome, preco, Cor, tamanho FROM encomenda INNER JOIN encomenda_produto USING (idEncomenda) INNER JOIN produto_tamanhoecor USING (idProduto_final) INNER JOIN produto USING (idProduto) INNER JOIN cores USING (idCores) INNER JOIN tamanhos USING (idTamanhos) WHERE idCliente = ' + req.session.idCliente + ';';
        pool.query(query, function (err, result, fields) {
            if (!err) {
                if (result && result.length > 0) {
                    html += '\n<script>';

                    html += 'document.getElementById("welcome_nome").innerHTML = "Olá ' + result[0][0].nome + '!";\n';
                    html += 'document.getElementById("profile_pic").src = "/../images/profile_pic/' + result[0][0].idCliente + '.jpg";\n';

                    html += '\n</script>\n';

                    var idEncomenda = 0;
                    var total = 0;
                    var index =
                    result[1].forEach(produto => {
                        total += produto.preco;
                    });

                    result[1].forEach(element => {
                        console.log(idEncomenda);
                        console.log(element);
                        console.log(result[1].length);
                        var index_last = parseInt(result[1].length);
                        if (idEncomenda == element.idEncomenda) {
                            html += '\n<div class="flex produto_singular">';
                            html += '\n<img class="produto_img_encomenda" alt="imagem de produto" src="/../images/produtos/' + element.idProduto + '.jpg">';
                            html += '\n<div style="flex-grow: 1;" class="flex space_between">';
                            html += '\n<div class="flex flex_collum space_between produto_card_encomenda"> ';
                            html += '\n<div class="title3">' + element.nome + '</div>';
                            html += '\n<div class="flex gap10"><div class="title4"> Cor: </div><div class="tamanho_selecionado">' + element.Cor + '</div></div>';
                            html += '\n<div class="flex gap10"><div class="title4"> Tamanho: </div><div class="tamanho_selecionado"> ' + element.tamanho + ' </div></div></div>';
                            html += '\n<div style="align-items: end;justify-content: center; padding-right:50px;" class="flex flex_collum produto_card_encomenda gap10">';
                            html += '\n<a href=""><div class="button5_red button5_text_red fit_content">Ver Produto</div></a>';
                            html += '\n<div class="flex gap10 flex_center">';
                            html += '\n<div class="disponibilidade_circle green"></div>';
                            html += '\n<div class="text2_left"> disponibilidade </div>';
                            html += '\n</div></div></div></div>';
                            html += '';
                            
                        }else {
                            html += '\n<div class="flex flex_center flex_collum gap75 user_historico fill_available">';
                            html += '\n<div class="flex flex_collum flex_center gap25 fill_available">';
                            html += '\n<div class="flex flex_center space_between fill_available">';
                            html += '\n<div class="flex flex_collum gap10">';
                            html += '\n<div>Encomenda nº: ' + element.idEncomenda + '</div>';
                            html += '\n<div>Data da encomenda: ' + (element.data).toLocaleString("pt-PT") + '</div>';
                            html += '\n<div>Total: ' + total + ' €</div>';
                            html += '\n<div id="hide_show_produtos" class="flex gap10 pointer"><div>Ver detalhes</div><img id="hide_show_produtos_seta" class="" src="/../images/icons/Seta_detalhes.svg" alt=""></div>';
                            html += '\n</div><div class="button4_red button4_text_red fit_content">Reencomendar</div></div>';
                            html += '\n<div id="encomenda_produtos" class="flex flex_collum encomenda_produtos fill_available gap10 hidden">';
                            idEncomenda += 1;
                        }
                        if(element == result[1][index_last-1]){
                            html += '\n</div>';
                            html += '\n<script src="/../js/open_show_produtos_encomenda.js"></script>';
                            html += '\n</div></div></div>';
                        }
                    });
                    //html += 'document.getElementById("nome").value = "' + result[1][0].nome + '";\n';
                    //html += 'document.getElementById("email").value = "' + result[1][0].email + '";\n';
                    //html += 'document.getElementById("num_tel").value = "' + result[1][0].num_tel + '";\n';
                    
                }else {
                    console.log('Não foi possível obter resultados')
                };
            }
            else {
                console.log(err)
                console.log('Erro ao executar pedido ao servidor')
            }
            html += footer;
            html += '</body>\n</html>';
            return res.send(html);
        });
    }else{
        return res.status(403).redirect('/login_error');
    };
});

// ALTERAR INFORMAÇÕES DO UTILIZADOR
servidor.post('/alterar_info_utilizador', logging, function (req, res) {
    var query ='';
    query += 'UPDATE cliente SET ';
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'nome="' + req.body.nome + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'email="' + req.body.email + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'num_tel="' + req.body.num_tel + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'morada="' + req.body.linha_endereço + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'codigo_postal="' + req.body.cod_postal_1 + '-' + req.body.cod_postal_2 + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'distrito="' + req.body.distrito + '" ';
    };
    query += 'WHERE idCliente = ' + req.session.idCliente + ';';
    pool.query(query, function (err, result, fields) {
        console.log(query);
        if (err) {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
        else {
            return res.redirect('/user');
        }
    });
});

// 404 NOT FOUND STATUS
servidor.use(function(req, res, next) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/err404.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>404 | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.status(404).send(html);
});