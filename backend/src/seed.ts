import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Book } from "./models/Book";
import { Club } from "./models/Club";
import { User } from "./models/User";
import { Post } from "./models/Post";
import { MONGO_URI } from "./config";

const sampleBooks = [
  {
    title: "Pollyanna",
    author: "Eleanor Hodgman Porter",
    coverUrl: "https://covers.openlibrary.org/b/id/902113-L.jpg",
    description:
      "An abridged version of the tale of orphaned, eleven-year-old Pollyanna, who comes to live with austere and wealthy Aunt Polly, bringing happiness to her aunt and other members of the community through her philosophy of gladness. Pollyanna knows the secret to finding a smile -- even when really bad things happen. From the moment she arrives in Beldingsville, she shares her Glad Game with everyone around her. But the person who needs Pollyanna's help the most doesn't want it.",
  },
  {
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    coverUrl: "https://covers.openlibrary.org/b/id/13301713-L.jpg",
    description:
      "A Tale of Two Cities is a historical novel published in 1859 by Charles Dickens, set in London and Paris before and during the French Revolution. The novel tells the story of the French Doctor Manette, his 18-year-long imprisonment in the Bastille in Paris, and his release to live in London with his daughter Lucie whom he had never met. The story is set against the conditions that led up to the French Revolution and the Reign of Terror. In the Introduction to the Encyclopedia of Adventure Fiction, critic Don D'Ammassa argues that it is an adventure novel because the protagonists are in constant danger of being imprisoned or killed.",
  },
  {
    title: "Best Selling Book Formula",
    author: "David Sheets",
    coverUrl: "",
    description: "",
  },
  {
    title:
      "The science of getting rich, or, financial success through creative thought",
    author: "Wallace D. Wattles",
    coverUrl: "https://covers.openlibrary.org/b/id/854989-L.jpg",
    description:
      "As featured in the bestselling book The Secret, here is the landmark guide to wealth creation republished with the classic essay How to Get What You Want.Wallace D. Wattles spent a lifetime considering the laws of success as he found them in the work of the worlds great philosophers. He then turned his life effort into this simple, slender book  a volume that he vowed could replace libraries of philosophy, spirituality, and self-help for the purpose of attaining one definite goal: a life of prosperity.Wattles describes a definite science of wealth attraction, built on the foundation of one commanding idea: There is a thinking stuff from which all things are madeA thought, in this substance, produces the thing that is imaged by the thought.In his seventeen short, straight-to-the-point chapters, Wattles shows how to use this idea, how to overcome barriers to its application, and how work with very direct methods that awaken it in your life. He further explains how creation and not competition is the hidden key to wealth attraction, and how your power to get rich uplifts everyone around you.The Science of Getting Rich concludes with Wattles rare essay How to Get Want You Want  a brilliant refresher of his laws of wealth creation.",
  },
  {
    title: "The Adventures of Sherlock Holmes [12 stories]",
    author: "Arthur Conan Doyle",
    coverUrl: "https://covers.openlibrary.org/b/id/6717853-L.jpg",
    description:
      "The Adventures of Sherlock Holmes is a collection of twelve short stories by Arthur Conan Doyle, first published on 14 October 1892. It contains the earliest short stories featuring the consulting detective Sherlock Holmes, which had been published in twelve monthly issues of The Strand Magazine from July 1891 to June 1892. The stories are collected in the same sequence, which is not supported by any fictional chronology. The only characters common to all twelve are Holmes and Dr. Watson and all are related in first-person narrative from Watson's point of view.",
  },
  {
    title: "The Brazilian sound",
    author: "Chris McGowan",
    coverUrl: "https://covers.openlibrary.org/b/id/4029984-L.jpg",
    description: "",
  },
  {
    title: "Tras la máscara del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8401540-L.jpg",
    description: "",
  },
  {
    title: "El Coyote = Llega el Coyote",
    author: "Carter Mulford",
    coverUrl: "https://covers.openlibrary.org/b/id/8351124-L.jpg",
    description: "",
  },
  {
    title: "Never Love a Stranger",
    author: "Harold Robbins",
    coverUrl: "https://covers.openlibrary.org/b/id/409409-L.jpg",
    description: "",
  },
  {
    title: "La victoria del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8396624-L.jpg",
    description: "",
  },
  {
    title: "Don César de Echagüe",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8401550-L.jpg",
    description: "",
  },
  {
    title: "El Diablo en Los Ángeles",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8401558-L.jpg",
    description: "",
  },
  {
    title: "La esposa de Don César",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8401571-L.jpg",
    description: "",
  },
  {
    title: "La hacienda trágica",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8401597-L.jpg",
    description: "",
  },
  {
    title: "Los jarrones del Virrey",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8401605-L.jpg",
    description: "",
  },
  {
    title: "Al servicio del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8401609-L.jpg",
    description: "",
  },
  {
    title: "El hijo del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8355319-L.jpg",
    description: "",
  },
  {
    title: "El final de la lucha",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8356207-L.jpg",
    description: "",
  },
  {
    title: "La diadema de las ocho estrellas",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8400767-L.jpg",
    description: "",
  },
  {
    title: "El secreto de la diligencia",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8400772-L.jpg",
    description: "",
  },
  {
    title: "La mano del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8424636-L.jpg",
    description: "",
  },
  {
    title: "La justicia del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8354262-L.jpg",
    description: "",
  },
  {
    title: "La marca del Cobra",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8356137-L.jpg",
    description: "",
  },
  {
    title: "Otra lucha",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8356160-L.jpg",
    description: "",
  },
  {
    title: "La vuelta del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352176-L.jpg",
    description: "",
  },
  {
    title: "Huracán sobre Monterrey = El Coyote en Monterrey",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352197-L.jpg",
    description: "",
  },
  {
    title: "El valle de la muerte",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352214-L.jpg",
    description: "",
  },
  {
    title: "La sombra del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352269-L.jpg",
    description: "",
  },
  {
    title: "El Coyote acorralado",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352283-L.jpg",
    description: "",
  },
  {
    title: "El otro Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352287-L.jpg",
    description: "",
  },
  {
    title: "Victoria secreta",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352292-L.jpg",
    description: "",
  },
  {
    title: "Sierra de oro",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352297-L.jpg",
    description: "",
  },
  {
    title: "El exterminio de la Calavera",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352304-L.jpg",
    description: "",
  },
  {
    title: "La primera aventura del Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8352866-L.jpg",
    description: "",
  },
  {
    title: "The Kinks",
    author: "Neville Marten",
    coverUrl: "https://covers.openlibrary.org/b/id/3014757-L.jpg",
    description: "",
  },
  {
    title: "Dealing with problem employees",
    author: "Amy DelPo",
    coverUrl: "https://covers.openlibrary.org/b/id/1621747-L.jpg",
    description: "",
  },
  {
    title: "Beyond the grave",
    author: "Gerald M. Condon",
    coverUrl: "https://covers.openlibrary.org/b/id/41338-L.jpg",
    description: "",
  },
  {
    title: "In my pocket",
    author: "Smithmark Publishing",
    coverUrl: "https://covers.openlibrary.org/b/id/1442908-L.jpg",
    description: "",
  },
  {
    title: "Guerra en la cuenca del Río Sauces",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8350418-L.jpg",
    description: "",
  },
  {
    title: "Al servicio del Sur",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8350521-L.jpg",
    description: "",
  },
  {
    title: "Foto-sex",
    author: "Ralph Barby",
    coverUrl: "https://covers.openlibrary.org/b/id/7347980-L.jpg",
    description: "",
  },
  {
    title: "Vuelve el Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8279649-L.jpg",
    description: "",
  },
  {
    title: "Rancho Desilusión",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8286518-L.jpg",
    description: "",
  },
  {
    title: "La prueba del plomo",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8286810-L.jpg",
    description: "",
  },
  {
    title: "Senda de balas",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8286830-L.jpg",
    description: "",
  },
  {
    title: "La legión del lobo",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8286894-L.jpg",
    description: "",
  },
  {
    title: "El valle de los 13 ahorcados",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8279719-L.jpg",
    description: "",
  },
  {
    title: "Toda esta tierra es mía I",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8311380-L.jpg",
    description: "",
  },
  {
    title: "Toda esta tierra es mía II",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8311387-L.jpg",
    description: "",
  },
  {
    title: "Tierra violenta",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8325131-L.jpg",
    description: "",
  },
  {
    title: "Selva de espinas I",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8312211-L.jpg",
    description: "",
  },
  {
    title: "Selva de espinas II",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8312214-L.jpg",
    description: "",
  },
  {
    title: "La rebelión de Luz Montoya I",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8312518-L.jpg",
    description: "",
  },
  {
    title: "La rebelión de Luz Montoya II",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8312521-L.jpg",
    description: "",
  },
  {
    title: "La ciudad sin ley",
    author: "Carter Mulford",
    coverUrl: "https://covers.openlibrary.org/b/id/8312732-L.jpg",
    description: "",
  },
  {
    title: "El sheriff de Losatumba",
    author: "Carter Mulford",
    coverUrl: "https://covers.openlibrary.org/b/id/8314323-L.jpg",
    description: "",
  },
  {
    title: "Jesse James",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8314424-L.jpg",
    description: "",
  },
  {
    title: "La vida de Lee Terrell",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8314447-L.jpg",
    description: "",
  },
  {
    title: "Matanza",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8315107-L.jpg",
    description: "",
  },
  {
    title: "Trece estrellas azules",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8315308-L.jpg",
    description: "",
  },
  {
    title: "Su seguro servidor el Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8288948-L.jpg",
    description: "",
  },
  {
    title: "Cuidado con el Coyote",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8288006-L.jpg",
    description: "",
  },
  {
    title: "El azote de la frontera",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8281195-L.jpg",
    description: "",
  },
  {
    title: "El tesoro de las misiones",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8281196-L.jpg",
    description: "",
  },
  {
    title: "Winter blues",
    author: "Norman E. Rosenthal",
    coverUrl: "https://covers.openlibrary.org/b/id/3941092-L.jpg",
    description: "",
  },
  {
    title: "Southern music/American music",
    author: "Bill C. Malone",
    coverUrl: "https://covers.openlibrary.org/b/id/607465-L.jpg",
    description: "",
  },
  {
    title: "Poison heart",
    author: "Dee Dee Ramone",
    coverUrl: "https://covers.openlibrary.org/b/id/721993-L.jpg",
    description: "",
  },
  {
    title: "Mapping the beat",
    author: "Thomas Swiss",
    coverUrl: "https://covers.openlibrary.org/b/id/4846595-L.jpg",
    description: "",
  },
  {
    title: "Un hombre alto",
    author: "Carlos de Santander",
    coverUrl: "https://covers.openlibrary.org/b/id/7335255-L.jpg",
    description: "",
  },
  {
    title: "El planeta maldito",
    author: "Clark Carrados",
    coverUrl: "https://covers.openlibrary.org/b/id/8027488-L.jpg",
    description: "",
  },
  {
    title: "A popular essay on bathing",
    author: "W. Bradfield",
    coverUrl: "https://covers.openlibrary.org/b/id/7915049-L.jpg",
    description: "",
  },
  {
    title: "El alfiler de oro",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8349232-L.jpg",
    description: "",
  },
  {
    title: "Everything Real Justin Bieber Fans Should Know Do",
    author: "Barry MacDonald",
    coverUrl: "https://covers.openlibrary.org/b/id/7663289-L.jpg",
    description: "",
  },
  {
    title: "Capitán Jíbaro",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8345125-L.jpg",
    description:
      "Debajo del uniforme de la confederación se ocultaba un forajido con sangre de caballero y apellido ilustre.",
  },
  {
    title: "Agonía de un planeta",
    author: "Ralph Barby",
    coverUrl: "https://covers.openlibrary.org/b/id/7347944-L.jpg",
    description:
      "¿Y a qué viene ahora esa tontería de presentarse al concurso de Miss Planetarium? La fémina, espigada, pero de curvas tan perfectas como las ya hacía milenios desaparecidas venus griegas o romanas, se movió delante del espejo que devolvía su imagen ataviada con el ajustado y corto vestido de plastiargenta.",
  },
  {
    title: "¡Devorados!",
    author: "Ralph Barby",
    coverUrl: "https://covers.openlibrary.org/b/id/7347978-L.jpg",
    description:
      '"No se podía negar que la base Ciudad Lunar estaba bien acondicionada. Había sido totalmente construida en un cráter del satélite de unos dos kilómetros de diámetro por medio de profundidad. Dicho cráter, antes de ser elegido por el Comité Mundial del Espacio, había sido estudiado concienzudamente, de ello hacía ya varias décadas. Una bóveda de cristal de diez pulgadas de espesor, en pedazos rectangulares de no menos de cien metros cuadrados cada uno, formaban un techo impresionante que sujetaba con firmeza la atmósfera artificial creada en base Ciudad Lunar. Dicha bóveda rompía los peligrosos y duros rayos solares sin tamizar por atmósfera alguna, filtrándolos y dividiéndolos en miríadas de rayos difusos que daban una luz semejante a la recibida, por ejemplo, en Miami Beach o la Costa del Sol española. Los quinientos metros de profundidad se habían dividido en pisos, dejando el más bajo y profundo para la instalación de energía atómica que daba vida a la base."',
  },
  {
    title: "Supervivencia",
    author: "Ralph Barby",
    coverUrl: "https://covers.openlibrary.org/b/id/7347985-L.jpg",
    description:
      '"Adam C. Lasiter se introdujo en el elevador. Las puertas se cerraron automáticamente. Pulsó el botón cuatro, que correspondía a la comandancia de la base espacial satélite W-144 y apenas se escuchó un leve zumbido. Inmediatamente, las puertas del camarín se abrieron de nuevo. El capitán Lasiter apenas dedicó una ojeada al corredor frío y aséptico que se abría ante él, completamente solitario. Se detuvo unos segundos ante una puerta de grueso cristal mientras la cámara de un televisor de circuito cerrado entregaba todos los datos del capitán a la computadora archivo de la nave. Cuando el cerebro electrónico dio su conformidad, se abrió la puerta de cristal franqueándole el paso, pero cerrando inmediatamente detrás de él. Dos pares de celadores no habrían montado mejor guardia, ya que nadie podía pasar por allí sin la placa de identificación que todos los miembros de la base espacial satélite W-144 estaban obligados a llevar prendidas en sus pechos."',
  },
  {
    title: "Desterrados de la Galaxia",
    author: "Clark Carrados",
    coverUrl: "https://covers.openlibrary.org/b/id/9793153-L.jpg",
    description:
      "En este mundo conviven dos ramas de la especie humana. Unos son los aborígenes del planeta, llamados Urtonitas. Los otros son los conocidos como Hombres-T, descendientes directos de los terrícolas que un día, siglos antes, se lanzaron a la exploración del Universo.",
  },
  {
    title: "El fantasma y miss Pitt",
    author: "Clark Carrados",
    coverUrl: "https://covers.openlibrary.org/b/id/9848807-L.jpg",
    description:
      '"Canturreaba entre dientes una vieja melodía, porque se sentía muy contento. La vida se abría ante él con espléndidas perspectivas y, aunque ya había pasado de los cincuenta años, tenía una salud de hierro y no le faltaba ningún diente. Lo único que velaba un tanto su júbilo era el pensamiento de lo que le podría pasar a miss Pitt cuando todo hubiese terminado, pero, al fin de cuentas, se dijo, ¿qué importaba ya aquella vieja que tenía un pie en la tumba?"',
  },
  {
    title: "Tres jinetes negros",
    author: "Amadeo Conde",
    coverUrl: "https://covers.openlibrary.org/b/id/8293652-L.jpg",
    description:
      "Tres hombres de negras ropas, negras armas y negras monturas, estos son los... Tres jinetes negros.",
  },
  {
    title: "La sangre de Abel Fearson",
    author: "Amadeo Conde",
    coverUrl: "https://covers.openlibrary.org/b/id/8297324-L.jpg",
    description: "",
  },
  {
    title: "Piedras amarillas",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8324644-L.jpg",
    description: "",
  },
  {
    title: "El cantor de Texas",
    author: "Leland R. Kitchell",
    coverUrl: "https://covers.openlibrary.org/b/id/8312730-L.jpg",
    description: "",
  },
  {
    title: "Herencia de odio",
    author: "Leland R. Kitchell",
    coverUrl: "https://covers.openlibrary.org/b/id/8312785-L.jpg",
    description: "",
  },
  {
    title: "El regreso de Kidd Garnett",
    author: "E. Mallory Ferguson",
    coverUrl: "https://covers.openlibrary.org/b/id/8314310-L.jpg",
    description: "",
  },
  {
    title: "Río Piedras",
    author: "Leland R. Kitchell",
    coverUrl: "https://covers.openlibrary.org/b/id/8314320-L.jpg",
    description: "",
  },
  {
    title: "Los vaqueros de Boot Hill",
    author: "E. Mallory Ferguson",
    coverUrl: "https://covers.openlibrary.org/b/id/8314327-L.jpg",
    description: "",
  },
  {
    title: "El hombre de Tejas",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8314353-L.jpg",
    description: "",
  },
  {
    title: "Pistas cruzadas",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8314436-L.jpg",
    description: "",
  },
  {
    title: "El rancho de la Flecha",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8314445-L.jpg",
    description: "",
  },
  {
    title: "Los desterrados de Cedar Creek",
    author: "J. Figueroa",
    coverUrl: "https://covers.openlibrary.org/b/id/8314538-L.jpg",
    description: "",
  },
  {
    title: "La ley del más fuerte",
    author: "J. Figueroa",
    coverUrl: "https://covers.openlibrary.org/b/id/8314553-L.jpg",
    description: "",
  },
  {
    title: "El sabueso de Vado Marcos",
    author: "J. Mallorquí",
    coverUrl: "https://covers.openlibrary.org/b/id/8314598-L.jpg",
    description: "",
  },
  {
    title: "Mid Life Confidential",
    author: "Dave Marsh",
    coverUrl: "https://covers.openlibrary.org/b/id/12873374-L.jpg",
    description: "",
  },
  {
    title: "Song means",
    author: "Allan F. Moore",
    coverUrl: "",
    description: "",
  },
  {
    title: "The globalization of Irish traditional song performance",
    author: "Susan H. Motherway",
    coverUrl: "",
    description: "",
  },
  {
    title: "Popular music and the myths of madness",
    author: "Nicola Spelman",
    coverUrl: "https://covers.openlibrary.org/b/id/9273985-L.jpg",
    description: "",
  },
  {
    title: "Dance and the Corporeal Uncanny",
    author: "Philipa Rothfield",
    coverUrl: "",
    description: "",
  },
  {
    title: "Aerial Dance",
    author: "Jenefer Davies",
    coverUrl: "https://covers.openlibrary.org/b/id/13660429-L.jpg",
    description: "",
  },
  {
    title: "The Irish traditional song performance",
    author: "Susan H. Motherway",
    coverUrl: "",
    description: "",
  },
];

async function seedBooks() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Book.deleteMany({});
    await Club.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    // Create a sample user
    const hashedPassword = await bcrypt.hash("password", 10);
    const sampleUser = new User({
      name: "Sample User",
      email: "sample@example.com",
      passwordHash: hashedPassword,
    });
    await sampleUser.save();
    console.log("Created sample user");

    // Insert sample books
    const books = await Book.insertMany(sampleBooks);
    console.log(`Seeded ${books.length} books`);

    // Create sample clubs
    const sampleClubs = [
      {
        name: "Fiction Lovers",
        description: "A club for fans of fiction books",
        owner: sampleUser._id,
        members: [sampleUser._id],
        currentBook: books[0]._id,
      },
      {
        name: "Sci-Fi Enthusiasts",
        description: "Discussing the latest in science fiction",
        owner: sampleUser._id,
        members: [sampleUser._id],
        currentBook: books[1]._id,
      },
      {
        name: "Classic Reads",
        description: "Timeless classics and their impact",
        owner: sampleUser._id,
        members: [sampleUser._id],
        currentBook: books[2]._id,
      },
    ];
    await Club.insertMany(sampleClubs);
    console.log(`Seeded ${sampleClubs.length} clubs`);

    // Create sample posts
    const samplePosts = [
      {
        user: sampleUser._id,
        book: books[0]._id,
        content:
          "This book was amazing! The characters were so well-developed.",
        rating: 5,
      },
      {
        user: sampleUser._id,
        book: books[1]._id,
        content:
          "A thought-provoking read. Highly recommend for dystopian fans.",
        rating: 4,
      },
      {
        user: sampleUser._id,
        book: books[2]._id,
        content: "Classic literature at its best. Timeless story.",
        rating: 5,
      },
    ];
    await Post.insertMany(samplePosts);
    console.log(`Seeded ${samplePosts.length} posts`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seedBooks();
