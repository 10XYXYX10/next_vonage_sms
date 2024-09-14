export type AuthUser = {
    id:number
    name:string
}

export interface SignUpFormState {
    error:string
    valueError:{
        name:string
        phoneNumber:string
        password:string
    }
    phoneNumber:string
}

export interface SignInFormState {
    error:string
    valueError:{
        phoneNumber:string
        password:string
    }
    phoneNumber:string
}

export interface SmsAuthFormState {
    result:boolean
    error:string
    valueError:{
        phoneNumber:string
        authenticationPassword:string
    }
}

export interface SignOutState {
    error:string
}