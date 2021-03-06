$(loginMenuBtn).on("click", loginMenu);
$(signUpMenuBtn).on("click", signUpMenu);

$(loginBtn).on("click", login)
$(getstartedBtn).on("click", signup)

/**
 * Function to display signUpMenu when clicking at signUpMenuBtn
 */
function signUpMenu() {
    document.getElementById("login").style.display ="none";
    document.getElementById("signup").style.display="block";
    document.getElementById("signUp").classList.add("active");
    document.getElementById("logIn").classList.remove("active");
}

/**
 * Function to display loginMenu when clicking at loginMenuBtn
 */
function loginMenu() {
    document.getElementById("signup").style.display="none";
    document.getElementById("login").style.display="block";
    document.getElementById("logIn").classList.add("active");
    document.getElementById("signUp").classList.remove("active");
}

/**
 * Checks if username and password is stored in the database. Stored user gets access to incubator, else get alert.
 */
function login() {

    var username = document.getElementById("username").value.toLowerCase();
    var password = document.getElementById("password").value;
    
    var found = users.find(function(e) {
        return e.username === username && e.password === password;
    });
    if (found) {
        location.href = "../HTML/home.html";
    }
    else {
        alert("Wrong password or username");
    }
}
                   
/**
 * Creates new user from input in singup felts, and specifies if name, username and password is to short.
 * If new user is created open loginMenu with username inserted
 */
function signup() {
    var signupFirstname = document.getElementById("signupFirstname").value;
    var signupLastname = document.getElementById("signupLastname").value;
    var signupUser = document.getElementById("signupUser").value;
    var signupPassword = document.getElementById("signupPassword").value;

    var name = signupFirstname + " " + signupLastname;
    var username = signupUser.toLowerCase();
    var password = signupPassword;

    if (name.length     <= 1 || name     === undefined || name     === null) {
        alert("Name too short");
        return;
    }
    if (username.length <= 1 || username === undefined || username === null) {
        alert("Username too short");
        return;
    } 
    if (password.length <= 1 || password === undefined || password === null) {
        alert("Password too short");
        return;
    }

    let newUser = CreateAndPushUser(name, username, password);

    loginMenu();
    document.getElementById("username").value = username;
    
}

