import { LocalizedLink } from "@/components/LocalizedLink"

const EmptyCartMessage = () => {
  return (
    <div>
      <div className="lg:h-22 pb-12 lg:pb-0 border-b border-b-grayscale-100">
        <h1 className="md:text-2xl text-lg leading-none">Tu carrito de compras</h1>
      </div>
      <p className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        No tienes nada en tu carrito. Cambiemos eso, usa
        el enlace de abajo para comenzar a explorar nuestros productos.
      </p>
      <div>
        <LocalizedLink href="/store">Explorar productos</LocalizedLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
