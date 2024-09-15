'use client'
import { useFormState } from 'react-dom';
import AlertError from '../AlertError';
import { SignUpFormState } from '@/lib/types';
import { signUp } from '@/actions/authFunctions';
import { inputClassVal, labelClassVal } from '@/lib/tailwindClassValue';
import { SubmitButton } from '../SubmitButton';
import MailAuth from './SmsAuth';


export default function SignUp() {
    const initialState:SignUpFormState = {
        error:'',
        valueError:{
            name:'',
            phoneNumber:'',
            password:'',
        },
        phoneNumber:'',
    };
    //const [state, formAction] = useActionState(signUp, initialState);
    const [state, formAction] = useFormState(signUp, initialState);

    return (<>
        <div className="flex items-center justify-center mt-5">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
                {state.error && <AlertError errMessage={state.error}/>}
                {!state.phoneNumber
                    ?(        
                        <form 
                            action={formAction}
                            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
                        >
                            <div className="mb-4">
                                <label className={`${labelClassVal}`}>ユーザー名<em>*</em></label>
                                <span className='text-xs text-gray-500'>{`「< > % ;」`}は使用できません</span>
                                <input
                                    name='name'
                                    type='text'
                                    required={true}
                                    placeholder="ユーザー名"
                                    className={`${state.valueError.name&&'border-red-500'} ${inputClassVal}`}
                                />
                                {state.valueError.name && <span className='text-red-500 text-xs italic'>{state.valueError.name}</span>}
                            </div>
                            <div className="mb-4">
                                <label className={`${labelClassVal}`}>070,080,090で始まる、日本の携帯電話番号<em>*</em></label>
                                <span className='text-xs text-gray-500'>11桁の携帯電話番号を入力して下さい</span>
                                <input
                                    name='phoneNumber'
                                    type='text'
                                    required={true}
                                    placeholder="09011112222"
                                    className={`${state.valueError.phoneNumber&&'border-red-500'} ${inputClassVal}`}
                                />
                                {state.valueError.phoneNumber && <span className='text-red-500 text-xs italic'>{state.valueError.phoneNumber}</span>}
                            </div>
                            <div className="mb-6">
                                <label className={`${labelClassVal}`}>パスワード<em>*</em></label>
                                <span className='text-xs text-gray-500'>5文字以上の半角の英数字を入力して下さい</span>
                                <input
                                    name='password'
                                    type='password'
                                    required={true}
                                    placeholder="パスワード"
                                    className={`${state.valueError.password&&'border-red-500'} ${inputClassVal}`}
                                />
                                {state.valueError.password && <span className='text-red-500 text-xs italic'>{state.valueError.password}</span>}
                            </div>
                            <div className='flex items-center justify-between'>
                                <SubmitButton text='SignUp'/>
                            </div>
                        </form>
                    ):(
                        <MailAuth phoneNumber={state.phoneNumber} typeValue={'SignUp'}/>
                    )
                }
            </div>
        </div>

    </>)
}