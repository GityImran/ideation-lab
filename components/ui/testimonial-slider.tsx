"use client"

import type React from "react"

import { useState, useRef, useEffect, forwardRef } from "react"
import Image from "next/image"
import { Transition } from "@headlessui/react"

interface Testimonial {
  img: string
  quote: string
  name: string
  role: string
}

export const TestimonialSlider = ({
  testimonials,
}: {
  testimonials: Testimonial[]
}) => {
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number>(0)
  const [autorotate, setAutorotate] = useState<boolean>(true)
  const autorotateTiming: number = 7000

  useEffect(() => {
    if (!autorotate) return
    const interval = setInterval(() => {
      setActive(active + 1 === testimonials.length ? 0 : (active) => active + 1)
    }, autorotateTiming)
    return () => clearInterval(interval)
  }, [active, autorotate, testimonials.length])

  const heightFix = () => {
    if (testimonialsRef.current && testimonialsRef.current.parentElement)
      testimonialsRef.current.parentElement.style.height = `${testimonialsRef.current.clientHeight}px`
  }

  useEffect(() => {
    heightFix()
  }, [])

  // Create a forwarded ref component for the image container
  const ImageContainer = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
    ({ children, className, ...props }, ref) => (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    ),
  )
  ImageContainer.displayName = "ImageContainer"

  // Create a forwarded ref component for the quote container
  const QuoteContainer = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
    ({ children, className, ...props }, ref) => (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    ),
  )
  QuoteContainer.displayName = "QuoteContainer"

  return (
    <div className="mx-auto w-full max-w-3xl text-center px-4 sm:px-0">
      <div className="relative h-24 sm:h-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] sm:h-[480px] w-[320px] sm:w-[480px] -translate-x-1/2 before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-gradient-to-b before:from-blue-500/25 before:via-blue-500/5 before:via-25% before:to-blue-500/0 before:to-75%">
          <div className="h-24 sm:h-32 [mask-image:_linear-gradient(0deg,transparent,theme(colors.white)_20%,theme(colors.white))]">
            {testimonials.map((testimonial, index) => (
              <Transition
                key={index}
                show={active === index}
                as={ImageContainer}
                className="absolute inset-0 -z-10 h-full"
                enter="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700 order-first"
                enterFrom="opacity-0 -rotate-[60deg]"
                enterTo="opacity-100 rotate-0"
                leave="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700"
                leaveFrom="opacity-100 rotate-0"
                leaveTo="opacity-0 rotate-[60deg]"
                beforeEnter={() => heightFix()}
              >
                <Image
                  className="relative left-1/2 top-8 sm:top-11 -translate-x-1/2 rounded-full"
                  src={testimonial.img || "/placeholder.svg"}
                  width={48}
                  height={48}
                  alt={testimonial.name}
                />
              </Transition>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-6 sm:mb-9 transition-all delay-300 duration-150 ease-in-out">
        <div className="relative flex flex-col" ref={testimonialsRef}>
          {testimonials.map((testimonial, index) => (
            <Transition
              key={index}
              show={active === index}
              as={QuoteContainer}
              enter="transition ease-in-out duration-500 delay-200 order-first"
              enterFrom="opacity-0 -translate-x-4"
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-out duration-300 delay-300 absolute"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-4"
              beforeEnter={() => heightFix()}
            >
              <div className="text-lg sm:text-2xl font-bold text-gray-900 before:content-['\201C'] after:content-['\201D']">
                {testimonial.quote}
              </div>
            </Transition>
          ))}
        </div>
      </div>
      <div className="-m-1 sm:-m-1.5 flex flex-wrap justify-center">
        {testimonials.map((testimonial, index) => (
          <button
            key={index}
            className={`m-1 sm:m-1.5 inline-flex justify-center whitespace-nowrap rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-300 dark:focus-visible:ring-blue-600 ${
              active === index
                ? "bg-blue-500 text-white shadow-blue-950/10"
                : "bg-white text-gray-900 hover:bg-blue-100"
            }`}
            onClick={() => {
              setActive(index)
              setAutorotate(false)
            }}
          >
            <span>{testimonial.name}</span>{" "}
            <span className={`${active === index ? "text-blue-200" : "text-gray-400"}`}>-</span>{" "}
            <span>{testimonial.role}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
