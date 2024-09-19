'use server'
import { validationForAuthenticationPassword, validationForPassword, validationForPhoneNumber, validationForWord } from "@/lib/functions/myValidation";
import { generateRandomNumber6, saveAccessTokenInCookies } from "@/lib/functions/seculity";
import prisma from "@/lib/prisma";
import { SignUpFormState, SignInFormState, SignOutState, SmsAuthFormState} from "@/lib/types";
import { sendSmsAuth } from "@/lib/vonage/function";
import * as bcrypt from 'bcrypt';
import { cookies } from "next/headers";

//新規User作成
export const signUp = async (state: SignUpFormState, formData: FormData) => {
    try{
        //////////
        //■[ formDataから値を取得 ]
        //・name
        const name = formData.get('name') as string;
        if(!name)state.valueError.name='Name is required';
        //・phoneNumber
        const phoneNumber = formData.get('phoneNumber') as string;
        if(!phoneNumber)state.valueError.phoneNumber='PhoneNumber is required';
        //・password
        const password = formData.get('password') as string;
        if(!password)state.valueError.password='Password is required';
        //＊
        if(!name || !phoneNumber || !password){
            state.error = 'Bad request error.'
            return state;
        }

        //////////
        //■[ validation ]
        //・name
        let result = validationForWord(name);
        if(!result.result){
            state.valueError.name=result.message;
        }else if(state.valueError.name){
            state.valueError.name='';
        }
        //・phoneNumber
        result = validationForPhoneNumber(phoneNumber);
        if(!result.result){
            state.valueError.phoneNumber=result.message;
        }else if(state.valueError.phoneNumber){
            state.valueError.phoneNumber='';
        }
        //・password
        result = validationForPassword(password);
        if(!result.result){
            state.valueError.password=result.message;
        }else if(state.valueError.password){
            state.valueError.password='';
        }
        //＊
        if(state.valueError.name || state.valueError.phoneNumber || state.valueError.password){
            state.error = 'Bad request error.';
            return state;
        }else if(state.error){
            state.error='';
        }

        //////////
        //■[ 不要データの削除 ]
        prisma.user.deleteMany({
            where: {
                verifiedPhoneNumber:false,
                createdAt: {
                    lt: new Date(Date.now() - 1000 * 60 * 4)//5分経過
                }
            }
        }).catch((err)=>console.log(err.message));

        //////////
        //■[ パスワードをハッシュ化 ]
        const hashed = await bcrypt.hash(password, 11);

        //////////
        //■[ 6桁の認証パスワードを生成 ]
        const randomNumber6 = generateRandomNumber6();

        //////////
        //■[ transaction ]
        await prisma.$transaction(async (prismaT) => {
            //新規User作成
            await prismaT.user.create({
                data: {
                    name:name,
                    hashedPassword: hashed,
                    phoneNumber,
                    verifiedPhoneNumber:false,
                    authenticationPassword:randomNumber6,
                },
            });
            //SMS認証番号を送信
            const {result,message} = await sendSmsAuth({
                phoneNumber,
                text: String(randomNumber6),
            });
            if(!result)throw new Error(message);
        },
        {
            maxWait: 10000, // default: 2000
            timeout: 25000, // default: 5000
        }).catch((err)=>{
            throw err;
        });
        
        //////////
        //■[ return(処理成功) ]
        state.phoneNumber = phoneNumber;
        return state
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }
};


//ログイン
export const signIn = async (state: SignInFormState, formData: FormData) => {
    try{
        //////////
        //■[ formDataから値を取得 ]
        //・phoneNumber
        const phoneNumber = formData.get('phoneNumber') as string;
        if(!phoneNumber)state.valueError.phoneNumber='PhoneNumber is required';
        //・password
        const password = formData.get('password') as string;
        if(!password)state.valueError.password='Password is required';
        //＊
        if(!phoneNumber || !password){
            state.error = 'Bad request error.'
            return state;
        }

        //////////
        //■[ validation ]
        //・phoneNumber
        let result = validationForPhoneNumber(phoneNumber);
        if(!result.result){
            state.valueError.phoneNumber=result.message;
        }else if(state.valueError.phoneNumber){
            state.valueError.phoneNumber='';
        }
        //・password
        result = validationForPassword(password);
        if(!result.result){
            state.valueError.password=result.message;
        }else if(state.valueError.password){
            state.valueError.password='';
        }
        //＊
        if(state.valueError.phoneNumber || state.valueError.password){
            state.error = 'Bad request error.'
            return state;
        }else if(state.error){
            state.error='';
        }

        //////////
        //■[ 認証:電話番号,パスワード ]
        //・電話番号
        const checkUser = await prisma.user.findFirst({
            where:{
                phoneNumber,
                verifiedPhoneNumber:true
            }
        });
        if(!checkUser){
            state.valueError.phoneNumber = 'PhoneNumber is incorrect';
            state.error = 'PhoneNumber is incorrect'
            return state;
        }
        //・パスワード
        try{
            const result = await bcrypt.compare(password, checkUser.hashedPassword);
            if(!result){
                state.valueError.password = 'Password is incorrect';
                state.error = 'Password is incorrect'
                return state;
            }
        }catch(err){
            throw err;
        }

        //////////
        //■[ SMS認証 ]◆
        //・6桁の乱数を生成
        const randomNumber6 = generateRandomNumber6();
        //・User の authenticationPassword & updatedAt を更新
        await prisma.user.update({
            where:{id:checkUser.id},
            data:{
                authenticationPassword:randomNumber6,
                updatedAt: new Date()
            }
        });
        //・SMS認証番号を送信
        const sendMailResult = await sendSmsAuth({
            phoneNumber,
            text: String(randomNumber6),
        });
        if(!sendMailResult.result)throw new Error(sendMailResult.message);
        
        //////////
        //■[ return(処理成功) ]
        state.phoneNumber = phoneNumber;
        return state
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }
};


//signUp,signIn：SMS認証
export const smsAuth = async (
    typeValue: 'SignUp'|'SignIn',
    state: SmsAuthFormState,
    formData: FormData
) => { 
    try{
        //////////
        //■[ formDataから値を取得 ]
        const phoneNumber = formData.get('phoneNumber') as string;
        const authenticationPassword = formData.get('authenticationPassword') as string;
        if(!phoneNumber || !authenticationPassword){
            state.error = 'Bad request error.'
            return state;
        }

        //////////
        //■[ validation ]
        //・phoneNumber
        let result = validationForPhoneNumber(phoneNumber);
        if(!result.result){
            state.valueError.phoneNumber=result.message;
        }else if(state.valueError.phoneNumber){
            state.valueError.phoneNumber='';
        }
        //・authenticationPassword
        result = validationForAuthenticationPassword(authenticationPassword);
        if(!result.result){
            state.valueError.authenticationPassword=result.message;
        }else if(state.valueError.authenticationPassword){
            state.valueError.authenticationPassword='';
        }
        //＊
        if(state.valueError.phoneNumber || state.valueError.authenticationPassword){
            state.error = 'Bad request error.'
            return state;
        }else if(state.error){
            state.error='';
        }

        //////////
        //■[ userチェック～経過時間の検証 ]
        const checkUser = await prisma.user.findUnique({
          where:{
            phoneNumber,
          }
        });
        //Userが存在しない
        if(!checkUser)throw new Error(`something went wrong. Please try again.`);
        //ログインを試みたが、電話番号の認証が未完了
        if(typeValue=='SignIn' && !checkUser.verifiedPhoneNumber)throw new Error('That user is disabled. SMS authentication has not been completed.');
        //認証パスワードが違う
        if(checkUser.authenticationPassword!==Number(authenticationPassword))throw new Error(`Authentication password is incorrect.`);
        //経過時間の検証：3分以上経過していたらエラーとする
        const beforeTime = checkUser.updatedAt;
        const currentTime = new Date();
        const elapsedMilliseconds = currentTime.getTime() - beforeTime.getTime();// beforeTimeから現在の日時までの経過時間(ミリ秒単位)を計算
        const elapsedMinutes = elapsedMilliseconds / (1000 * 60);// 経過時間を分単位に変換
        if (elapsedMinutes >= 3){
          if(typeValue==='SignUp')await prisma.user.delete({where:{id:checkUser.id}});//User新規作成時、3分超過により認証が失敗した場合は、Userを削除
          throw new Error(`More than 3 minutes have passed. Please try again.`);
        }

        //////////
        //■[ 新規作成時のSMS認証なら、verifiedPhoneNumber:true に更新 ]
        if(typeValue==='SignUp'){
            await prisma.user.update({
                where:{id:checkUser.id},
                data:{
                    verifiedPhoneNumber:true
                }
            });
        }

        //////////
        //■[ accessToken をサーバーサイドcookiesに保存 ]
        const savedResult = await saveAccessTokenInCookies({id:checkUser.id, name:checkUser.name});
        if(!savedResult.result)throw new Error(savedResult.message);
        
        //////////
        //■[ return(処理成功) ]
        return state;

    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }

    //////////
    //■[ 処理成功 ]
    //revalidatePath('/','layout');
}


export const signOut = async(state: SignOutState) => {
    try{
        //////////
        //■[ jwtをサーバーサイドcookieから削除 ]
        if(cookies().get('accessToken'))cookies().delete('accessToken');

        //////////
        //■[ return(処理成功) ]
        //・これがないと、上のif文の判定でfalse時に、処理が何も実行されないということになるので、
        //　クライアントサイドで使用しようとした際に、型エラーとなる
        return state;

    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }
} 