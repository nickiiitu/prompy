"use client";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
const Auth = () => {
  const [providers, setProviders] = useState(null);
  const [form, setForm] = useState({});
  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);
  const router = useRouter();
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
              console.log(provider);
              {
                /* return provider.name === "Credentials" ? (
                <>
                  {/* <>
                  <form className="mt-7">
                    <label htmlFor="email">Email</label>
                    <br></br>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="text-black rounded-md border-black p-1"
                      onChange={(e) => {
                        setForm((pre) => ({
                          ...pre,
                          [e.target.name]: e.target.value,
                        }));
                      }}
                      value={form.email}
                    />
                    <br></br>
                    <label htmlFor="password">Password</label>
                    <br></br>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="text-black rounded-md border-black p-1 "
                      onChange={(e) => {
                        setForm((pre) => ({
                          ...pre,
                          [e.target.name]: e.target.value,
                        }));
                      }}
                      value={form.password}
                    />
                    <button
                      type="submit"
                      key={provider.name}
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!form.email) {
                          alert("Enter a valid Email");
                          return;
                        }
                        if (!form.password) {
                          alert("Enter a valid Password");
                          return;
                        }
                        const res = await signIn("credentials", {
                          redirect: false,
                          password: form.password,
                          email: form.email,
                        });
                        console.log(res);
                        if (res && !res?.error) {
                          router.push("/");
                        } else {
                          setForm({ password: "", email: "" });
                          alert(res.error);
                        }
                      }}
                      className="black_btn  mt-4"
                    >
                      Sign in with {provider.name}
                    </button>
                  </form>
                </> 
                
              ) :  */
              }
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
                  {/* <p>---------Or----------</p> */}
                </button>
              );
            })}
        </section>
      </div>
    </>
  );
};

export default Auth;
