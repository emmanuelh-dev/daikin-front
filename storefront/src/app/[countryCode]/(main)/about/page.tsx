// External components
import Image from "next/image"
import { StoreRegion } from "@medusajs/types"

// Lib
import { listRegions } from "@lib/data/regions"

// Components
import { Layout, LayoutColumn } from "@/components/Layout"

export async function generateStaticParams() {
  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions.flatMap((r) =>
      r.countries
        ? r.countries
            .map((c) => c.iso_2)
            .filter(
              (value): value is string =>
                typeof value === "string" && Boolean(value)
            )
        : []
    )
  )

  const staticParams = countryCodes.map((countryCode) => ({
    countryCode,
  }))

  return staticParams
}

export default function AboutPage() {
  return (
    <>
      <div className="max-md:pt-18">
        <Image
          src="/images/content/daikin-termo.jpg"
          width={2880}
          height={1500}
          alt="Oficinas de Daikin"
          className="md:h-screen md:object-cover"
        />
      </div>
      <div className="pt-8 md:pt-26 pb-26 md:pb-36">
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-lg max-lg:mb-6 md:text-2xl">
              En Daikin, creemos que el confort y la eficiencia energética deben ir de la mano.
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="md:text-md lg:mt-18">
              <p className="mb-6 lg:mb-8">
                Bienvenido a Daikin, donde nos dedicamos a crear soluciones de climatización avanzadas y de alta calidad para aplicaciones residenciales, comerciales e industriales. Nuestra misión es proporcionar ambientes saludables y confortables a través de la innovación y la sostenibilidad.
              </p>
              <p>
                Cada producto en nuestra gama está diseñado con precisión, combinando la experiencia de más de 100 años en la industria con las últimas tecnologías para ofrecer el equilibrio perfecto entre rendimiento y eficiencia energética.
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn>
            <Image
              src="/images/content/daikin-producto.png"
              width={2496}
              height={1404}
              alt="Producto Daikin"
              className="mt-26 lg:mt-36 mb-8 lg:mb-26"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, lg: 8 }}>
            <h3 className="text-lg lg:mb-10 mb-6 md:text-2xl">
              Estamos aquí para hacer de su espacio un reflejo verdadero de su estilo personal.
            </h3>
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, lg: 6 }}>
            <div className="mb-16 lg:mb-36">
              <p className="mb-6">
                En el corazón de nuestra marca se encuentra un profundo compromiso con la calidad. Entendemos que un sistema de climatización no es solo un equipo; es una inversión en su comodidad y bienestar. Por eso, seleccionamos solo los materiales y componentes más finos, asegurando que cada producto que ofrecemos esté construido para durar.
              </p>
              <p>
                Desde sistemas de aire acondicionado de alta eficiencia hasta soluciones de calefacción y ventilación, cada componente es cuidadosamente elegido por su durabilidad y rendimiento. Nuestra atención al detalle se extiende a cada aspecto de nuestros productos, garantizando que no solo se vean impresionantes, sino que también resistan la prueba del tiempo.
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 2, lg: 1 }} end={{ base: 12, lg: 7 }}>
            <Image
              src="/images/content/daikin-fabrica.jpeg"
              width={1200}
              height={1600}
              alt="Fábrica Daikin"
              className="mb-16 lg:mb-36"
            />
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="mb-6 lg:mb-20 xl:mb-36">
              <p>
                Nuestra filosofía de diseño se centra en crear productos que sean tanto hermosos como prácticos. Inspirados en la simplicidad escandinava, el lujo moderno y los clásicos atemporales, nuestras colecciones están curadas para adaptarse a una amplia variedad de gustos y estilos de vida. Sabemos que cada hogar es diferente, por lo que ofrecemos una gama diversa de estilos, colores y texturas para ayudarle a encontrar el ajuste perfecto. Ya sea que prefiera líneas modernas y elegantes o siluetas suaves y acogedoras, tenemos algo para cada espacio y personalidad.
              </p>
            </div>
            <div className="md:text-md max-lg:mb-26">
              <p>
                Creemos que un gran diseño debe ser consciente del medio ambiente, por lo que nos esforzamos por minimizar nuestra huella ambiental a través de prácticas responsables de abastecimiento y producción. Nuestro compromiso con la sostenibilidad asegura que nuestros productos no solo sean hermosos, sino también amables con el planeta.
              </p>
            </div>
          </LayoutColumn>
        </Layout>
        <Image
          src="/images/content/daikin-living-room.png"
          width={2880}
          height={1618}
          alt="Sala de estar con productos Daikin"
          className="mb-8 lg:mb-26"
        />
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-lg max-lg:mb-8 md:text-2xl">
              ¡Nuestros clientes están en el centro de todo lo que hacemos!
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="md:text-md lg:mt-18">
              <p className="mb-6 lg:mb-8">
                Nuestro equipo está aquí para guiarle a través del proceso, ofreciendo soporte personalizado para asegurarse de que encuentre exactamente lo que busca.
              </p>
              <p>
                No solo vendemos sistemas de climatización; le ayudamos a crear espacios donde pueda relajarse, recargar energías y crear recuerdos duraderos. ¡Gracias por elegir a Daikin para ser parte de su hogar!
              </p>
            </div>
          </LayoutColumn>
        </Layout>
      </div>
    </>
  )
}
