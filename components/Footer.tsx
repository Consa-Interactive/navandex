"use client";

export default function Footer() {
  return (
    <footer className="print:hidden py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <p>
        Developed by{" "}
        <a
          href="https://github.com/Consa-Interactive"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Consa Interactive
        </a>
      </p>
    </footer>
  );
}