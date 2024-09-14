//汎用的なXSS対策
export const validationForWord = (str:string,limit:number=20): {result:boolean, message:string} => {
    // 長さ1～20の範囲
    if (str.length===0 || str.length>limit) return {result:false, message:`1～${limit}字以内の文字列を入力して下さい`}
	//htmlエンティティ
	const pattern = /[<>%"`';?&=]/;
	if(pattern.test(str))return{result:false, message:'「<>%"`\';?&=」これらの文字列は使用不可です'};
    // 成功!!
    return {result:true,message:'success'}
}

//メールアドレスのバリデーション
export const validationForMail = (str:string): {result:boolean, message:string} => {
    //長さ1～20の範囲
    if(str.length===0 || str.length>40)return {result:false, message:'1～40字以内のメールアドレを入力して下さい'};
    //email形式
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const result = emailRegex.test(str);
    if(!result)return {result:false, message:'有効なメールアドレスの形式でありません'};
    // 成功!!
    return {result:true,message:'success'}
}

//パスワードのバリデーション
export const validationForPassword = (str:string): {result:boolean, message:string} => {
    //長さ5～50の範囲
    if(str.length<4 || str.length>50)return {result:false, message:'5～50字以内の半角の英数字を入力して下さい'};
    //email形式
    const passwordRegex = /^[A-Za-z0-9]+$/;
    const result = passwordRegex.test(str);
    if(!result)return {result:false, message:'半角の英数字で入力して下さい'};
    // 成功!!
    return {result:true,message:'success'}
}

//authenticationPassword(6桁の数字)
export const validationForAuthenticationPassword = (str:string): {result:boolean, message:string} => {
    //6桁
    if(str.length!==6)return {result:false, message:'6桁の半角数字を入力して下さい'};
    //半角数字
    const temporaryPasswordRegex = /^[0-9]+$/;
    const result = temporaryPasswordRegex.test(str);
    if(!result)return {result:false, message:'半角数字で入力して下さい'};
    // 成功!!
    return {result:true,message:'success'}
}

//「070,080,090 + 8桁の」日本の携帯電話番号
export const validationForPhoneNumber = (str:string): {result:boolean, message:string} => {
    //11桁
    if(str.length!==11)return {result:false, message:'11桁の半角数字を入力して下さい'};
    //半角数字
    const japanesePhoneNumberRegex = /^0[7-9]0\d{8}$/;
    const result = japanesePhoneNumberRegex.test(str);
    if(!result)return {result:false, message:'070,080,090のいずれかで始まる11桁の半角数字を入力して下さい'};
    // 成功!!
    return {result:true,message:'success'}
}


