import { Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="h-52 border-t border-(--border-color) bg-(--bg-secondary)">
      <div className="relative mx-auto max-w-5xl px-6 h-full">
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-10 text-center text-9xl text-(--text-secondary)/10 tracking-wider font-bold select-none">
          Tareas
        </div>

        {/* Bottom */}
        <div className="flex flex-col justify-center gap-4 h-full">
          <div className="text-md text-(--text-secondary)/70">Tareas</div>
          <a
            href="#"
            className="text-(--text-secondary)/50 transition-colors flex gap-3 items-center hover:text-(--text-secondary) w-fit"
            aria-label="Twitter"
          >
            <Github size={18} />
            <p className="text-sm">Github</p>
          </a>
          <a
            href="#"
            className="text-(--text-secondary)/50 transition-colors flex gap-3 items-center hover:text-(--text-secondary) w-fit"
            aria-label="Twitter"
          >
            <Twitter size={18} />
            <p className="text-sm">Twitter</p>
          </a>
        </div>
      </div>
    </footer>
  )
}
