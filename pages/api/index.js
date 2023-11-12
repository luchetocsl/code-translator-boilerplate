import { useState } from "react";
import CodeWindow from "@/components/CodeWindow";
import background from "@/public/background.jpg";
import twitter_image from "@/public/twitter.png";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState(``);
  const [outputCode, setOutputCode] = useState("");
  const [inputLanguage, setInputLanguage] = useState("JavaScript");
  const [outputLanguage, setOutputLanguage] = useState("Python");

  const handleInputLanguageChange = (option) => {
    setInputLanguage(option.value);
    setInputCode("");
    setOutputCode("");
  };

  const handleOutputLanguageChange = (option) => {
    setOutputLanguage(option.value);
    setOutputCode("");
  };

  const handleTranslate = async () => {
    const maxCodeLength = 6000;

    if (inputLanguage === outputLanguage) {
      alert("Please select different languages.");
      return;
    }

    if (!inputCode) {
      alert("Please enter some code.");
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`,
      );
      return;
    }

    setLoading(true);
    setOutputCode("");

    const controller = new AbortController();

    const body = {
      inputLanguage,
      outputLanguage,
      inputCode,
    };

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert("Something went wrong.");
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert("Something went wrong.");
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        className="fixed left-0 top-0 -z-10 h-screen w-screen"
        src={background}
        alt="Background"
      />
      <h1 className="justify-center pt-5 font-sans text-5xl font-bold ">
        Code Translator
      </h1>
      <h2 className="mb-10 mt-5 justify-center font-sans text-xl text-slate-600">
        Translate your code to another programming language. With just a click.
      </h2>
      {/* input code window */}
      <CodeWindow
        code={inputCode}
        setCode={setInputCode}
        loading={loading}
        handleLanguageChange={handleInputLanguageChange}
        language={inputLanguage}
      />

      {/* translate button */}
      <button
        disabled={loading}
        className="m-2  flex items-center justify-center rounded-lg border-white bg-[#C53AAE] p-3 font-semibold text-white"
        onClick={handleTranslate}
      >
        {loading ? `Translating...` : `Translate 🔁`}
      </button>

      {/* output code window */}
      <CodeWindow
        code={outputCode}
        setCode={setOutputCode}
        loading={loading}
        handleLanguageChange={handleOutputLanguageChange}
        language={outputLanguage}
      />
      <p className="mt-5 pb-5 font-sans">
        Powered by{" "}
        <a
          className="ref-link text-[#C53AAE]"
          href="http://metaschool.so/"
          target="_blank"
          rel="noopener noreferrer"
        >
          metaschool 🔮
        </a>
      </p>
      <a
        className=" mb-5 flex items-center p-1 font-sans"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          "Check out this awesome code translator!",
        )}&url=${encodeURIComponent("https://metaschool.so")}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          className="mr-0.5 justify-center"
          src={twitter_image}
          alt="Twitter"
        />
        Share it on Twitter
      </a>
    </div>
  );
}
