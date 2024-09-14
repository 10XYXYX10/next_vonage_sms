import Image from "next/image"

const Page = () => {
  return (
    <div>
        <h2 className="text-center text-lg sm:text-2xl font-bold mt-5">ログイン成功！！</h2>
        <div className="p-3 flex justify-center">
          <Image
            className="overflow-hidden rounded-full"
            src='/loneProgrammer_square.jpg'
            width='500'
            height='500'
            alt="lone_programmer"
          />          
        </div>
    </div>
  )
}
export default Page
