import Image from "next/image";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className="bg-brand p-10 hidden w-1/2 items-center justify-center lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
          <div className="flex gap-0 items-center">
            <Image
              src="/assets/icons/logo-4.png"
              alt="logo"
              height={50}
              width={120}
              className="hidden lg:block "
            />
            <p className="hidden invert h-auto lg:block font-bold text-3xl pt-8 ">
              StoreHouse
            </p>
          </div>

          <div className="space-y-5 text-white">
            <h1 className="h1">Manage your files the best way</h1>
            <p className="body-1">
              This is a place where you can store all your documents
            </p>
          </div>
          <Image
            src="/assets/icons/file-new.webp"
            alt="files"
            width={342}
            height={342}
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="flex gap-0 items-center lg:hidden mb-16">
          <Image
            src="/assets/icons/logo-4.svg"
            alt="logo"
            height={100}
            width={100}
            className=""
          />
          <p className=" h-auto font-bold text-3xl pt-8 pr-8">StoreHouse</p>
        </div>
        {children}
      </section>
    </div>
  );
};

export default Layout;
