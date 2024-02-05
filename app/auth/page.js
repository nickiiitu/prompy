"use client";
import { signIn, getProviders } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
const Auth = () => {
  const [providers, setProviders] = useState(null);
  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);
  return (
    <>
      <div className="w-full h-screen flex items-center justify-between orange_gradient max-sm:flex-col">
        <section className="sm:p-10 flex-center flex-col w-3/5 h-full max-sm:my-3">
          <Image
            src="/assets/images/display.png"
            alt="display"
            width={100}
            height={30}
            className="object-contain w-full rounded-md h-full"
          />
        </section>
        <section className="p-10 flex-center flex-col sm:w-2/5 orange_gradient grad sm:me-8 max-sm:mb-4">
          <div className="mb-7 flex-center flex-col">
            <Link href={"/"}>
              <Image
                src="/assets/images/logo.svg"
                alt="logo"
                width={30}
                height={30}
                className="object-contain"
              />
            </Link>
            <span className="orange_gradient text-center text-3xl my-1">
              {" "}
              Prompy
            </span>
          </div>

          {providers &&
            Object.values(providers).map((provider) => {
              return (
                <button
                  type="button"
                  key={provider.id}
                  onClick={() => {
                    signIn(provider.id, { callbackUrl: "/" });
                  }}
                  className="black_btn mb-7 mt-1"
                >
                  Sign in with {provider.name}
                </button>
              );
            })}
        </section>
      </div>
    </>
  );
};

export default Auth;
