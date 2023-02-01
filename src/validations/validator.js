//======================================= Name Regex Validation ========================================//
const validateName = (name) => {
    return (/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i.test(name));
}

//====================================== Email Regex Validation =======================================//
const validateEmail = (email) => {
    return (/^[a-z0-9](\.?[a-z0-9]){3,}@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/.test(email));
}

//==================================== Number Regex Validation ======================================//
const validateMobileNo = (Number) => {
    return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(Number));
}

//===================================== Password Regex Validation ====================================//
const validatePassword = (password) => {
    return (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password));
}

//===================================== Place Regex Validation ===================================//
const validatePlace = (value) => {
    return (/^[^\W\d_]+\.?(?:[-\s'’][^\W\d_]+\.?)*$/).test(value);
}

//===================================== Pincode Regex Validation ===================================//
const validatePincode = (pincode) => {
    return (/^[1-9][0-9]{5}$/).test(pincode);
}


module.exports = {validateName , validateEmail , validateMobileNo , validatePassword , validatePlace , validatePincode};