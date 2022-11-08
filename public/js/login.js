var popUp = document.getElementById("registo_popUp");

function session_clearInputs() {
    if (popUp == document.getElementById("registo_popUp")){
        document.getElementById("registo_nome").value = '';
        document.getElementById("registo_email").value = '';
        document.getElementById("registo_telemovel").value = '';
        document.getElementById("registo_password").value = '';
    }else if(popUp == document.getElementById("login_popUp")){
        document.getElementById("login_email").value = '';
        document.getElementById("login_password").value = '';
    };
}

function session_abrir(id) {
    document.getElementById(id).style.display = "flex";
    popUp = document.getElementById(id);
    session_clearInputs()
}

function session_fechar(id, check) {
    if(check == false){
        popUp = document.getElementById(id)
        popUp.style.display = "none"
    }else{
        if(popUp == document.getElementById("login_popUp")){
            var email = document.getElementById("login_email");
            var pass = document.getElementById("login_password");
            if (email.value != '' && pass.value != '') {
                popUp = document.getElementById(id)
                popUp.style.display = "none"
                console.log("Sessão Iniciada!")
            }else{
                console.log("Prencha os dados")
            }
        }
    }
}

function session_abrirFechar(popUp_Abrir, popUp_fechar, check) {
    if(check == false){
        session_fechar(popUp_fechar, false);
        session_abrir(popUp_Abrir);
    }
    else{
        var name = document.getElementById("registo_nome");
        var email = document.getElementById("registo_email");
        var tlm = document.getElementById("registo_telemovel");
        var pass1 = document.getElementById("registo_password");
        var pass2 = document.getElementById("registo_password_repetido");
        console.log(name, email, tlm, pass1, pass2)

        name.oninvalid = function (){name.setCustomValidity('É necessário que prencher o nome');};
        email.oninvalid = function (){email.setCustomValidity('É necessário que prencher o email');};
        pass1.oninvalid = function (){pass1.setCustomValidity('A password não pode estar vazia')};

        if(name.value != ''){
            if(email.value.includes('@') && email.value.includes('.')){
                if(pass1.value != '' && pass2.value != ''){
                    if(pass1.value == pass2.value){
                        session_fechar(popUp_fechar, false);
                        session_abrir(popUp_Abrir);
                    }else{
                        pass2.setCustomValidity('A password repedida não corresponde à password original.');
                        console.log("A password repedida não corresponde à password original.")
                    };
                }else{
                    if (pass2.value == ''){
                        pass2.setCustomValidity('A password não pode estar vazia')
                    }
                    console.log("A password não pode estar vazia")
                };
            }else{
                console.log("É necessário email para poder recuperar password.")
            };
        }else{
            console.log("É necessário que prencher o nome")
        };
    }
}

window.onclick = function (event){
    if (event.target == document.getElementById("registo_popUp") || event.target == document.getElementById("login_popUp")){
        popUp.style.display = "none"
    }
}