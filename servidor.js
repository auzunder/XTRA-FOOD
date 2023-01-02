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
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
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
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
    });
});

// PROCESSAR LOGIN 
servidor.post("/processa_login", logging, function (req, res) {
    var query = '';
    query += 'SELECT idCliente, nome, email, password, num_tel FROM cliente WHERE email = "' + req.body.email + '" AND password = "' + sha(req.body.password) + '";';

    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                if (req.query.via_voluntariado == "true"){
                    return res.redirect("/processa_voluntariado_form?via_voluntario=true&nome=" + result[0].nome + "&email=" + result[0].email + "&num_tel=" + result[0].num_tel);
                }else{
                    console.log(result)
                    req.session.login_ = null
                    req.session.idCliente = result[0].idCliente
                    return res.redirect('back')
                };
            }else{
                console.log('Sem resultados SQL')
                return res.status(500).redirect('/InternalError');
            }
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
    });
});

// LOG OUT
servidor.get("/log_out", logging, function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            return res.status(500).redirect('/InternalError');
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
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
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

    //HTML Content
    html += content;

    if (req.session.idCliente){
        var query = 'SELECT nome, email, password, num_tel FROM cliente WHERE idCliente = ' + req.session.idCliente + ';';
        pool.query(query, function (err, result, fields) {
            if (!err){
                if (result && result.length > 0) {
                    console.log(result)
                    html += '<script>document.getElementById("login_voluntariado_button").innerHTML = "SUBMETER COMO ' + (result[0].nome).toUpperCase() + '"</script>';
                    var url = "'/processa_voluntariado_form?via_voluntario=true&nome=" + result[0].nome + "&email=" + result[0].email + "&num_tel=" + result[0].num_tel + "'";
                    html += '<script>document.getElementById("login_voluntariado_button").onclick = null;</script>';
                    html += '<script>document.getElementById("login_voluntariado_button").onclick = () => window.location = ' + url + ';</script>';
                    html += footer;
                    
                    //HTML close
                    html += '\n</body>\n</html>';
                    return res.send(html);
                }else{
                    console.log('Sem resultados de Cliente');
                    return res.status(500).redirect('/InternalError');
                };
            }else {
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
            };
        });
    }else{
        html += footer;

        //HTML close
        html += '\n</body>\n</html>';
        return res.send(html);
    };
});

servidor.get("/processa_voluntariado_form", logging, function (req, res) {
    var query ='';
    query = 'INSERT INTO voluntarios (nome, email, num_tel) VALUES ("' + req.query.nome + '", "' + req.query.email + '", "' + req.query.num_tel + '");';
    console.log (req.query);
    pool.query(query, function (err, result, fields) {
        if (!err){
            return res.status(200).redirect('/obrigado?motivo=voluntariado');
        }else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
});

servidor.get("/obrigado", logging, function (req, res) {
    //HTML head
    var html = '';
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Obrigado! | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
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

    console.log(req.query);

    if (req.query.motivo == 'voluntariado'){
        var pag_volta = '/voluntariado';
        var pag_volta_nome = 'Voluntariado';
        var obrigado_text = 'Obrigado pela submissão, foste registado como disponível para voluntariado! Iremos entrar em contacto assim que necessário para combinar todas as informações.';
    }else if (req.query.motivo == 'doacao') {
        var pag_volta = '/doacao';
        var pag_volta_nome = 'Doação';
        var obrigado_text = 'Obrigado pela tua doacao! Ficamos extremamente agradecidos pela tua contribuição nesta luta contra fome.';
    }else if (req.query.motivo == 'newsletter') {
        var pag_volta = '/';
        var pag_volta_nome = 'Home';
        var obrigado_text = 'Obrigado pelo teu registo na nossa newsletter! Iremos sempre enviar informações importantes sobre o que temos feito e sobre os nossos eventos.';
    }else if (req.query.motivo == 'pedido_servico') {
        var pag_volta = '/parceiros';
        var pag_volta_nome = 'Parceiros';
        var obrigado_text = 'Obrigado pelo teu pedido! Assim que possível, iremos rever a sua aplicação e entraremos em contacto caso seja aceite.';
    }

    //HTML Content
    html += '<div class="flex flex_center flex_collum wrapper content_wrapper"><div class="flex flex_center flex_collum info_block gap75"><div class="title">OBRIGADO!</div><div class="text">'+ obrigado_text +'</div><a href="' + pag_volta + '"><button class="button1_red button1_text_red" type="button">Voltar para: ' + pag_volta_nome + '</button></a></div></div>';

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
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

// GUARDAR FORM DOAÇAO
servidor.post("/processa_doacao", logging, function (req, res) {
    var query = '';
    query += 'INSERT INTO doacao (nome, apelido, num_tel, email, quantidade, metodo, data) VALUES ("' + req.body.nome + '", "' + req.body.apelido + '", "' + req.body.num_tel + '", "' + req.body.email + '", "' + req.body.quantidade_donativo + '", "' + req.body.metodo_pagamento + '", "' + ((new Date().toISOString()).replace('T', ' ')).replace('Z', '') + '");';
    console.log(query);

    pool.query(query, function (err, result, fields) {
        if (!err) {
            return res.status(200).redirect('/obrigado?motivo=doacao');
        } else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
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

// GUARDAR FORM PARCEIROS
servidor.post("/processa_parceiros", logging, function (req, res) {
    var query = '';
    query += 'INSERT INTO pedidos_servicos (nome, apelido, email, num_tel, nome_empresa, num_tel_empresa, pag_web_empresa, email_empresa, parceiro_afiliado, decricao_empresa) VALUES ("' 
    + req.body.nome + '", "' 
    + req.body.apelido + '", "' 
    + req.body.email + '", "' 
    + req.body.num_tel + '", "' 
    + req.body.nome_empresa + '", "' 
    + req.body.num_tel_empresa + '", "' 
    + req.body.pag_web_empresa + '", "' 
    + req.body.email_empresa + '", "' 
    + req.body.tipo_de_servico + '", "' 
    + req.body.descricao_empresa + '");';
    console.log(query);

    pool.query(query, function (err, result, fields) {
        if (!err) {
            return res.status(200).redirect('/obrigado?motivo=pedido_servico');
        } else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
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

    var query = '';
    query += 'SELECT cartaz_img, nome, descricao, localizacao, voluntariar, data FROM evento WHERE data >= "' + new Date().toISOString() + '" ORDER BY data ASC;';

    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                for (var i=0; i < result.length; i++){
                    if (i/2 == Math.floor(i/2)){
                        html += '<div class="event_cards_lines flex">';
                        html += '<div class="event_card flex"><img alt="CARTAZ" src="/images/eventos/'+ result[i].cartaz_img +'">';
                        html += '<div class="info_event_card flex flex_collum"><div class="descricao_event">' + result[i].descricao + '</div>';
                        html += '<div class="static_info flex flex_collum"><div class="localizacao_event flex"><img alt="icon" src="images/icons/Localização.png"><div class="localizacao">' + result[i].localizacao + '</div></div>';
                        if (result[i].voluntariar == 1){
                            html += '<a href="/voluntariado"><div class="vagas_event_alerta flex"><img alt="icon" src="images/icons/Alerta.png"><div class="vagas">Vagas abertas para voluntariado</div></div></a>';
                        };
                        html += '</div></div></div>';
                    }else{
                        html += '<div class="event_card flex"><img alt="CARTAZ" src="/images/eventos/'+ result[i].cartaz_img +'">';
                        html += '<div class="info_event_card flex flex_collum"><div class="descricao_event">' + result[i].descricao + '</div>';
                        html += '<div class="static_info flex flex_collum"><div class="localizacao_event flex"><img alt="icon" src="images/icons/Localização.png"><div class="localizacao">' + result[i].localizacao + '</div></div>';
                        if (result[i].voluntariar == 1){
                            html += '<a href="/voluntariado"><div class="vagas_event_alerta flex"><img alt="icon" src="images/icons/Alerta.png"><div class="vagas">Vagas abertas para voluntariado</div></div></a>';
                        };
                        html += '</div></div></div>';
                        html += '</div>';
                    };
                }
            }else {
                console.log('Não foi possível obter resultados')
            };
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
    html += '</div></div></div>';
    html += footer;
    html += '</body>\n</html>';
    return res.send(html);
    });
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
servidor.get("/loja/produto", logging, function (req, res) {
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
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
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
        query += 'SELECT idEncomenda, data FROM encomenda WHERE idCliente = ' + req.session.idCliente + ' ORDER BY data DESC;';
        pool.query(query, function (err, result, fields) {
            if (!err) {
                if (result && result.length > 0) {
                    html += '\n<script>';

                    html += 'document.getElementById("welcome_nome").innerHTML = "Olá ' + result[0][0].nome + '!";\n';
                    html += 'document.getElementById("profile_pic").src = "/../images/profile_pic/' + result[0][0].idCliente + '.jpg";\n';

                    html += '\n</script>\n';

                    var total_encomenda = {};
                    result[2].forEach(encomenda =>{
                        var total = 0;
                        result[1].forEach(produto => {
                            if (produto.idEncomenda == encomenda.idEncomenda) {
                                total += produto.preco;
                            };
                        });
                        total_encomenda[encomenda.idEncomenda] = total;
                    });

                    console.log(total_encomenda)

                    html += '\n<div class="flex flex_center flex_collum gap75 user_historico fill_available">';
                    result[2].forEach(encomenda =>{
                        var total = 0;
                        html += '\n<div class="flex flex_collum flex_center gap25 fill_available">';
                        html += '\n<div class="flex flex_center space_between fill_available">';
                        html += '\n<div class="flex flex_collum gap10">';
                        html += '\n<div>Encomenda nº: ' + encomenda.idEncomenda + '</div>';
                        html += '\n<div>Data da encomenda: ' + (encomenda.data).toLocaleString("pt-PT") + '</div>';
                        html += '\n<div>Total: ' + total_encomenda[encomenda.idEncomenda] + ' €</div>';
                        html += '\n<div class="flex gap10 pointer" onclick="hide_show_produtos('+"'" + encomenda.idEncomenda + "'"+')"><div>Ver detalhes</div><img id="hide_show_produtos_seta_' + encomenda.idEncomenda + '" class="" src="/../images/icons/Seta_detalhes.svg" alt=""></div>';
                        html += '\n</div><div class="button4_red button4_text_red fit_content">Reencomendar</div></div>';
                        html += '\n<div id="encomenda_produtos_' + encomenda.idEncomenda + '" class="flex flex_collum encomenda_produtos fill_available gap10 hidden">';
                        //console.log("Encomenda: ", encomenda);
                        result[1].forEach(produto => {
                            if (produto.idEncomenda == encomenda.idEncomenda) {
                                //console.log("Encomenda: ", produto);
                                html += '\n<div class="flex produto_singular">';
                                html += '\n<img class="produto_img_encomenda" alt="imagem de produto" src="/../images/produtos/' + produto.idProduto + '.jpg">';
                                html += '\n<div style="flex-grow: 1;" class="flex space_between">';
                                html += '\n<div class="flex flex_collum space_between produto_card_encomenda"> ';
                                html += '\n<div class="title3">' + produto.nome + '</div>';
                                html += '\n<div class="flex gap10"><div class="title4"> Cor: </div><div class="tamanho_selecionado">' + produto.Cor + '</div></div>';
                                html += '\n<div class="flex gap10"><div class="title4"> Tamanho: </div><div class="tamanho_selecionado"> ' + produto.tamanho + ' </div></div>';
                                html += '\n<div class="flex gap10"><div class="title4"> Preço: </div><div class="tamanho_selecionado"> ' + produto.preco + ' </div></div></div>';
                                html += '\n<div style="align-items: end;justify-content: center; padding-right:50px;" class="flex flex_collum produto_card_encomenda gap10">';
                                html += '\n<a href="/loja/produto?id=' + produto.idProduto + '"><div class="button5_red button5_text_red fit_content">Ver Produto</div></a>';
                                html += '\n<div class="flex gap10 flex_center">';
                                html += '\n<div class="disponibilidade_circle green"></div>';
                                html += '\n<div class="text2_left"> disponibilidade </div>';
                                html += '\n</div></div></div></div>';
                                
                            };
                        });
                        html += '\n</div></div>';
                        html += '\n<script>var aberto_' + encomenda.idEncomenda + ' = false;</script>'
                    });
                    html += '\n</div></div></div>';
                    html += '\n<script src="/../js/open_show_produtos_encomenda.js"></script>';

                    //html += 'document.getprodutoById("nome").value = "' + result[1][0].nome + '";\n';
                    //html += 'document.getprodutoById("email").value = "' + result[1][0].email + '";\n';
                    //html += 'document.getprodutoById("num_tel").value = "' + result[1][0].num_tel + '";\n';
                    
                }else {
                    console.log('Não foi possível obter resultados')
                };
            }
            else {
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
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