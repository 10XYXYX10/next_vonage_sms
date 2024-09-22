'use client'
import { useFormState } from 'react-dom';
import AlertError from '../AlertError';;
import { SmsAuthFormState } from '@/lib/types';
import { smsAuth } from '@/actions/authFunctions';
import { inputClassVal, labelClassVal } from '@/lib/tailwindClassValue';
import { SubmitButton } from '../SubmitButton';

const MailAuth = ({
    phoneNumber,
    typeValue,
}:{
    phoneNumber:string
    typeValue: 'SignUp'|'SignIn',
}) => {
    const smsAuthWithTypeValue = smsAuth.bind(null, typeValue);
    const initialState:SmsAuthFormState = {
        error:'',
        valueError:{
            phoneNumber:'',
            authenticationPassword:'',
        },
    };
    //const [state, formAction] = useActionState(signUp, initialState);
    const [state, formAction] = useFormState(smsAuthWithTypeValue, initialState);

    return(<>
        <div className="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
                <p className='text-red-600'>
                    ☎{phoneNumber}に、認証パスワードを送信しました
                </p>

                {state.error && <AlertError errMessage={state.error} reloadBtFlag={true}/>}

                <form 
                    action={formAction}
                    className="mt-3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
                >
                    <input
                        name='phoneNumber'
                        type='hidden'
                        required={true}
                        defaultValue={phoneNumber}
                    />
                    <div className="mb-4">
                        <label className={`${labelClassVal}`}>6桁認証番号<em>*</em></label>
                        <span className='text-xs text-gray-500'>6桁の半角数字を入力して下さい</span>
                        <input
                            name='authenticationPassword'
                            type='text'
                            required={true}
                            placeholder="認証パスワード"
                            className={`${state.valueError.authenticationPassword&&'border-red-500'} ${inputClassVal}`}
                        />
                        {state.valueError.authenticationPassword&& 
                            <span className='text-red-500 text-xs italic'>
                                {state.valueError.authenticationPassword}
                            </span>
                        }
                    </div>
                    <div className='flex items-center justify-between'>
                        <SubmitButton text='Submit'/>
                    </div>
                </form>
            </div>
        </div>
    </>);
}
export default MailAuth;