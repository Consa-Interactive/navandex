"use client";

export default function Footer() {
  return (
    <footer className="print:hidden flex justify-center items-center z-10 py-4 rounded-md text-center text-sm text-white dark:text-orange-400 border-t border-gray-200 dark:border-gray-700 bg-orange-400/95 dark:bg-gray-800/50 backdrop-blur-sm">
      <p>
        Developed by{" "}
        <a
          href="https://github.com/Consa-Interactive"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-white hover:text-slate-200 transition-colors"
        >
          Coonsa Interactive
        </a>
      </p>
    </footer>
  );
}
