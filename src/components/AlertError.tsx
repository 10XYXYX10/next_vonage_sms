'use client'
import { IconAlertTriangle } from "@tabler/icons-react"

export default function AlertError({
    errMessage,
    reloadBtFlag=true,
}:{
    errMessage:string
    reloadBtFlag?:boolean
}){
    return(
        <div className="border-red-500 border-2 rounded-md p-4 bg-red-100 w-full max-w-md mx-auto mt-10">
            <div className="flex flex-col text-red-600">
                <IconAlertTriangle className="mr-2"/>
                <span className="break-all">{errMessage}</span>
            </div>
            {reloadBtFlag && 
                <button 
                    onClick={()=>location.reload()} 
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                >
                    ページをリロード
                </button>
            }
        </div>
    )
}
