import { choice, order, packSubject, type SubjectLessonSpec, type SubjectWorldSpec } from '@/data/subjects/pack'

function lesson(
  title: string,
  objective: string,
  skill: string,
  instructions: string,
  items: SubjectLessonSpec['items'],
): SubjectLessonSpec {
  return { title, objective, skill, instructions, items }
}

const worlds: SubjectWorldSpec[] = [
  {
    id: 'english-hello',
    title: 'Hello World',
    subtitle: 'Saludos y frases de cortesía',
    icon: '👋',
    lessons: [
      lesson('Hello and goodbye', 'Saludar y despedirse.', 'en-saludo', 'Escucha en inglés y elige.', [
        choice('You meet a friend. What do you say?', 'HELLO', ['HELLO', 'GOOD NIGHT', 'THANK YOU'], { speak: 'hello' }),
        choice('You leave school. What do you say?', 'GOODBYE', ['GOODBYE', 'HELLO', 'PLEASE'], { speak: 'goodbye' }),
        choice('Someone gives you a pencil. You say…', 'THANK YOU', ['THANK YOU', 'GOODBYE', 'WHAT'], { speak: 'thank you' }),
        choice('You want something. You say…', 'PLEASE', ['PLEASE', 'GOOD NIGHT', 'NO NAME'], { speak: 'please' }),
      ]),
      lesson('My name is', 'Decir y reconocer un nombre.', 'en-nombre', 'My name is… presenta quién eres.', [
        choice('“My name is Luna.” Who is Luna?', 'THE SPEAKER', ['THE SPEAKER', 'THE SCHOOL', 'A COLOR'], { speak: 'My name is Luna' }),
        choice('How do you ask a name?', 'WHAT IS YOUR NAME?', ['WHAT IS YOUR NAME?', 'HOW OLD IS THE SUN?', 'WHERE IS THE MOON?'], { speak: 'What is your name?' }),
        choice('Complete: My ___ is Sam.', 'NAME', ['NAME', 'CAT', 'BLUE'], { speak: 'My name is Sam' }),
        choice('A friendly answer to “What is your name?”', 'MY NAME IS ANA', ['MY NAME IS ANA', 'I AM A TABLE', 'GOODBYE NAME'], { speak: 'What is your name?' }),
      ]),
      lesson('How are you?', 'Reconocer estados sencillos.', 'en-estado', 'No hace falta pronunciar para acertar.', [
        choice('“I am happy.” The person feels…', 'HAPPY', ['HAPPY', 'HUNGRY ONLY', 'A NUMBER'], { speak: 'I am happy' }),
        choice('“I am sad.” Choose the feeling.', 'SAD', ['SAD', 'TALL', 'GREEN'], { speak: 'I am sad' }),
        choice('A kind answer to “How are you?”', 'I AM FINE', ['I AM FINE', 'I AM A CHAIR', 'SEVEN'], { speak: 'How are you?' }),
        choice('“See you later” is closest to…', 'GOODBYE', ['GOODBYE', 'PLEASE', 'RED'], { speak: 'See you later' }),
      ]),
      lesson('Please and thank you', 'Usar cortesía en una situación.', 'en-cortesia', 'Please pide. Thank you agradece.', [
        choice('You ask for water. Start with…', 'PLEASE', ['PLEASE', 'GOODBYE', 'EIGHT'], { speak: 'Water, please' }),
        choice('After you receive it, you say…', 'THANK YOU', ['THANK YOU', 'HELLO DOOR', 'BLUE'], { speak: 'thank you' }),
        choice('“Excuse me” is for…', 'GETTING ATTENTION', ['GETTING ATTENTION', 'SAYING A COLOR', 'COUNTING'], { speak: 'Excuse me' }),
        choice('Which is polite?', 'THANK YOU', ['THANK YOU', 'GO AWAY NOW', 'NO WORD'], { speak: 'thank you' }),
      ]),
      lesson('Hello story', 'Comprender un diálogo muy corto.', 'en-dialogo', 'Lee las dos líneas y elige.', [
        choice('Ana: Hello. Leo: Hello, Ana. They are…', 'GREETING', ['GREETING', 'COUNTING', 'NAMING COLORS'], { speak: 'Hello. Hello, Ana.' }),
        choice('Leo: How are you? Ana: I am fine. Ana feels…', 'FINE', ['FINE', 'A CIRCLE', 'HUNGRY ONLY'], { speak: 'How are you? I am fine.' }),
        choice('Ana: Thank you. Leo: You are welcome. Leo is being…', 'KIND', ['KIND', 'A NUMBER', 'A COLOR'], { speak: 'Thank you. You are welcome.' }),
        order('Order the greeting.', ['you?', 'are', 'How'], 'How are you?', { speak: 'How are you?' }),
      ]),
    ],
  },
  {
    id: 'english-colors',
    title: 'Colors and Shapes',
    subtitle: 'Colores, formas y objetos',
    icon: '🔴',
    lessons: [
      lesson('Find the color', 'Reconocer colores en inglés.', 'en-color', 'Listen and choose the color.', [
        choice('Which word is red?', 'RED', ['RED', 'BLUE', 'GREEN'], { speak: 'red', image: '🔴' }),
        choice('The sky word is…', 'BLUE', ['BLUE', 'BLACK', 'ORANGE'], { speak: 'blue', image: '🔵' }),
        choice('Grass is usually…', 'GREEN', ['GREEN', 'PINK', 'WHITE'], { speak: 'green', image: '🟢' }),
        choice('The sun is often drawn…', 'YELLOW', ['YELLOW', 'PURPLE', 'BLACK'], { speak: 'yellow', image: '🟡' }),
      ]),
      lesson('Shapes', 'Nombrar círculo, cuadrado y triángulo.', 'en-shape', 'Shape is the form, not the color.', [
        choice('A ball looks like a…', 'CIRCLE', ['CIRCLE', 'TRIANGLE', 'SQUARE'], { speak: 'circle' }),
        choice('A slice of pizza looks like a…', 'TRIANGLE', ['TRIANGLE', 'CIRCLE', 'RECTANGLE'], { speak: 'triangle' }),
        choice('A window with equal sides can be a…', 'SQUARE', ['SQUARE', 'CIRCLE', 'OVAL'], { speak: 'square' }),
        choice('A door is often a…', 'RECTANGLE', ['RECTANGLE', 'TRIANGLE', 'CIRCLE'], { speak: 'rectangle' }),
      ]),
      lesson('Color plus object', 'Unir color y objeto.', 'en-color', 'Listen to both words.', [
        choice('A red apple is…', 'RED', ['RED', 'BLUE', 'BLACK'], { speak: 'red apple', image: '🍎' }),
        choice('“Blue book.” The object is a…', 'BOOK', ['BOOK', 'CAT', 'SHOE'], { speak: 'blue book' }),
        choice('“Yellow star.” The color is…', 'YELLOW', ['YELLOW', 'GREEN', 'PINK'], { speak: 'yellow star', image: '⭐' }),
        choice('Which is a green frog?', 'GREEN FROG', ['GREEN FROG', 'RED CAR', 'BLUE MILK'], { speak: 'green frog', image: '🐸' }),
      ]),
      lesson('Simple instructions', 'Comprender una orden corta.', 'en-instruccion', 'Point or choose. You do not need to speak.', [
        choice('“Point to the circle.” You look for a…', 'CIRCLE', ['CIRCLE', 'SQUARE', 'CAT'], { speak: 'Point to the circle' }),
        choice('“Touch something blue.” A good choice is…', 'THE SKY PICTURE', ['THE SKY PICTURE', 'A RED APPLE', 'A YELLOW SUN'], { speak: 'Touch something blue' }),
        choice('“Show me green.” You show…', 'GREEN', ['GREEN', 'BLACK', 'ORANGE'], { speak: 'Show me green' }),
        choice('“Clap” means…', 'PALM HANDS', ['PALM HANDS', 'CLOSE YOUR EYES FOREVER', 'SAY A NUMBER'], { speak: 'Clap' }),
      ]),
      lesson('What color is it?', 'Responder el color de un objeto conocido.', 'en-color', 'The picture gives the meaning. The word is English.', [
        choice('🍌 What color is it?', 'YELLOW', ['YELLOW', 'BLUE', 'BLACK'], { speak: 'What color is the banana?', image: '🍌' }),
        choice('🍃 What color is it?', 'GREEN', ['GREEN', 'RED', 'PURPLE'], { speak: 'What color is the leaf?', image: '🍃' }),
        choice('🍓 What color is it?', 'RED', ['RED', 'YELLOW', 'WHITE'], { speak: 'What color is the strawberry?', image: '🍓' }),
        choice('🌊 The sea is often…', 'BLUE', ['BLUE', 'ORANGE', 'PINK'], { speak: 'The sea is blue', image: '🌊' }),
      ]),
    ],
  },
  {
    id: 'english-family',
    title: 'My Family and My Body',
    subtitle: 'Familia, cuerpo y emociones',
    icon: '👨‍👩‍👧',
    lessons: [
      lesson('Family words', 'Reconocer madre, padre, hermana y hermano.', 'en-familia', 'These words name people.', [
        choice('Mother in English is…', 'MOM', ['MOM', 'BROTHER', 'BABY CAT'], { speak: 'mom' }),
        choice('Father in English is…', 'DAD', ['DAD', 'SISTER', 'TEACHER'], { speak: 'dad' }),
        choice('A girl with the same parents is a…', 'SISTER', ['SISTER', 'BROTHER', 'UNCLE'], { speak: 'sister' }),
        choice('A boy with the same parents is a…', 'BROTHER', ['BROTHER', 'MOM', 'BABY'], { speak: 'brother' }),
      ]),
      lesson('My body', 'Señalar partes del cuerpo en inglés.', 'en-cuerpo', 'Listen and choose the part.', [
        choice('You see with your…', 'EYES', ['EYES', 'KNEES', 'HAIR'], { speak: 'eyes' }),
        choice('You hear with your…', 'EARS', ['EARS', 'ELBOWS', 'TOES'], { speak: 'ears' }),
        choice('You walk with your…', 'FEET', ['FEET', 'EARS', 'NOSE'], { speak: 'feet' }),
        choice('You wave with your…', 'HAND', ['HAND', 'KNEE', 'EAR'], { speak: 'hand' }),
      ]),
      lesson('Feelings', 'Nombrar emociones básicas.', 'en-emocion', 'A feeling is not a color.', [
        choice('A smile goes with…', 'HAPPY', ['HAPPY', 'SAD', 'ANGRY'], { speak: 'happy' }),
        choice('Tears can mean…', 'SAD', ['SAD', 'TALL', 'HUNGRY'], { speak: 'sad' }),
        choice('A growl and a frown can mean…', 'ANGRY', ['ANGRY', 'SLEEPY', 'GREEN'], { speak: 'angry' }),
        choice('Yawning can mean…', 'SLEEPY', ['SLEEPY', 'BLUE', 'A BROTHER'], { speak: 'sleepy' }),
      ]),
      lesson('This is my…', 'Completar una frase de una palabra.', 'en-familia', 'This is my + the person or part.', [
        choice('This is my ___. She is a girl in my family.', 'SISTER', ['SISTER', 'NOSE', 'RED'], { speak: 'This is my sister' }),
        choice('This is my ___. I see with them.', 'EYES', ['EYES', 'DAD', 'SHOES'], { speak: 'These are my eyes' }),
        choice('He is my father’s son. He is my…', 'BROTHER', ['BROTHER', 'MOM', 'HAND'], { speak: 'He is my brother' }),
        order('Order the sentence.', ['mom', 'is', 'This', 'my'], 'This is my mom', { speak: 'This is my mom' }),
      ]),
      lesson('Describe simply', 'Unir persona y una cualidad.', 'en-describir', 'Short phrases are enough.', [
        choice('“She is happy.” She feels…', 'HAPPY', ['HAPPY', 'A TABLE', 'SEVEN'], { speak: 'She is happy' }),
        choice('“He is my dad.” He is…', 'DAD', ['DAD', 'A COLOR', 'A CIRCLE'], { speak: 'He is my dad' }),
        choice('“I have two eyes.” The number is…', 'TWO', ['TWO', 'TEN', 'ZERO'], { speak: 'I have two eyes' }),
        choice('“My sister is kind.” Kind means…', 'AMABLE', ['AMABLE', 'A SHOE', 'A NUMBER'], { speak: 'My sister is kind' }),
      ]),
    ],
  },
  {
    id: 'english-animals',
    title: 'Animals and Nature',
    subtitle: 'Animales, naturaleza y clima',
    icon: '🐶',
    lessons: [
      lesson('Meet the animals', 'Reconocer animales frecuentes.', 'en-animal', 'Match the English word.', [
        choice('What animal is this? 🐶', 'DOG', ['DOG', 'FISH', 'BIRD'], { speak: 'dog', image: '🐶' }),
        choice('What animal is this? 🐱', 'CAT', ['CAT', 'COW', 'FROG'], { speak: 'cat', image: '🐱' }),
        choice('What animal is this? 🐟', 'FISH', ['FISH', 'BIRD', 'DOG'], { speak: 'fish', image: '🐟' }),
        choice('What animal is this? 🐦', 'BIRD', ['BIRD', 'CAT', 'HORSE'], { speak: 'bird', image: '🐦' }),
      ]),
      lesson('Where do they live?', 'Unir animal y lugar con una frase corta.', 'en-habitat-en', 'Listen to the place.', [
        choice('A fish lives in the…', 'WATER', ['WATER', 'SKY ONLY', 'LIBRARY'], { speak: 'The fish lives in the water' }),
        choice('A bird can fly in the…', 'SKY', ['SKY', 'SOUP', 'SHOE'], { speak: 'The bird is in the sky' }),
        choice('A cow is often on a…', 'FARM', ['FARM', 'CLOUD', 'BOOK'], { speak: 'The cow is on the farm' }),
        choice('A frog likes…', 'WATER AND LAND', ['WATER AND LAND', 'ONLY THE MOON', 'A KEYBOARD'], { speak: 'The frog likes water' }),
      ]),
      lesson('Weather words', 'Nombrar sol, lluvia y viento.', 'en-clima', 'Weather is what you see outside.', [
        choice('What is the weather? ☀️', 'SUNNY', ['SUNNY', 'RAINY', 'SNOWY'], { speak: 'It is sunny', image: '☀️' }),
        choice('What is the weather? 🌧️', 'RAINY', ['RAINY', 'SUNNY', 'WINDY'], { speak: 'It is rainy', image: '🌧️' }),
        choice('💨 Moving air is…', 'WINDY', ['WINDY', 'HUNGRY', 'BLUE'], { speak: 'It is windy' }),
        choice('A gray sky and rain. It is…', 'RAINY', ['RAINY', 'SUNNY', 'A DOG'], { speak: 'It is rainy' }),
      ]),
      lesson('Nature words', 'Árbol, flor, sol y mar.', 'en-naturaleza', 'These are things you can see outside.', [
        choice('What is this? 🌳', 'TREE', ['TREE', 'FISH', 'SHOE'], { speak: 'tree', image: '🌳' }),
        choice('What is this? 🌸', 'FLOWER', ['FLOWER', 'CAR', 'BOOK'], { speak: 'flower', image: '🌸' }),
        choice('The big water by the beach is the…', 'SEA', ['SEA', 'MOON', 'DESK'], { speak: 'sea', image: '🌊' }),
        choice('We see the sun in the…', 'SKY', ['SKY', 'SHOE', 'SOUP'], { speak: 'The sun is in the sky' }),
      ]),
      lesson('Animal sentence', 'Completar una frase de animal.', 'en-animal', 'Build a short sentence.', [
        order('Order the sentence.', ['cat', 'The', 'is', 'small'], 'The cat is small', { speak: 'The cat is small' }),
        choice('“The dog can run.” The animal is a…', 'DOG', ['DOG', 'FISH', 'TREE'], { speak: 'The dog can run' }),
        choice('“Birds can fly.” Fly means…', 'MOVE IN THE SKY', ['MOVE IN THE SKY', 'SLEEP UNDER WATER', 'BE A COLOR'], { speak: 'Birds can fly' }),
        choice('A baby dog is a…', 'PUPPY', ['PUPPY', 'KITTEN', 'CALF'], { speak: 'puppy' }),
      ]),
    ],
  },
  {
    id: 'english-everyday',
    title: 'Numbers, Food and Everyday Life',
    subtitle: 'Números, comida, casa y rutina',
    icon: '🍎',
    lessons: [
      lesson('Numbers', 'Contar del uno al cinco en inglés.', 'en-numero', 'Listen to the number.', [
        choice('How many? ⭐', 'ONE', ['ONE', 'THREE', 'FIVE'], { speak: 'one' }),
        choice('How many? 🍎🍎', 'TWO', ['TWO', 'FOUR', 'ONE'], { speak: 'two' }),
        choice('How many? 🐟🐟🐟', 'THREE', ['THREE', 'TWO', 'FIVE'], { speak: 'three' }),
        choice('The word after four is…', 'FIVE', ['FIVE', 'TWO', 'TEN'], { speak: 'five' }),
      ]),
      lesson('Food', 'Reconocer frutas y comidas básicas.', 'en-comida', 'Food words go with eating.', [
        choice('What food is this? 🍎', 'APPLE', ['APPLE', 'BREAD', 'MILK'], { speak: 'apple', image: '🍎' }),
        choice('What food is this? 🍌', 'BANANA', ['BANANA', 'WATER', 'RICE'], { speak: 'banana', image: '🍌' }),
        choice('What food is this? 🥛', 'MILK', ['MILK', 'APPLE', 'BREAD'], { speak: 'milk', image: '🥛' }),
        choice('What food is this? 🍞', 'BREAD', ['BREAD', 'JUICE', 'EGG'], { speak: 'bread', image: '🍞' }),
      ]),
      lesson('Home and school', 'Nombrar lugares cotidianos.', 'en-lugar-en', 'Home is casa. School is escuela.', [
        choice('You sleep in a…', 'BED', ['BED', 'BUS', 'CLOUD'], { speak: 'bed' }),
        choice('You read a…', 'BOOK', ['BOOK', 'SHOE', 'RAIN'], { speak: 'book' }),
        choice('Students learn at…', 'SCHOOL', ['SCHOOL', 'THE SEA ONLY', 'A NEST'], { speak: 'school' }),
        choice('A place with a stove is the…', 'KITCHEN', ['KITCHEN', 'SKY', 'POND'], { speak: 'kitchen' }),
      ]),
      lesson('Clothes', 'Reconocer ropa frecuente.', 'en-ropa', 'Clothes are what you wear.', [
        choice('You wear these on your feet.', 'SHOES', ['SHOES', 'HAT', 'BOOK'], { speak: 'shoes' }),
        choice('A ___ keeps your head warm.', 'HAT', ['HAT', 'SOCK ON THE HEAD ONLY', 'PLATE'], { speak: 'hat' }),
        choice('A shirt covers your…', 'BODY', ['BODY', 'ONLY THE EYES', 'THE MOON'], { speak: 'shirt' }),
        choice('On a rainy day you may take an…', 'UMBRELLA', ['UMBRELLA', 'ICE CREAM ONLY', 'PILLOW TO THE RAIN'], { speak: 'umbrella' }),
      ]),
      lesson('My day', 'Ordenar una rutina simple.', 'en-rutina', 'First, then, after.', [
        order('Order the morning.', ['breakfast', 'wake up', 'school'], 'wake up breakfast school', { speak: 'I wake up, I eat breakfast, I go to school' }),
        choice('You eat breakfast in the…', 'MORNING', ['MORNING', 'MIDDLE OF THE NIGHT ONLY', 'SEA'], { speak: 'I eat breakfast in the morning' }),
        choice('After school, many children…', 'GO HOME', ['GO HOME', 'GO TO THE MOON', 'BECOME A COLOR'], { speak: 'I go home' }),
        choice('At night you…', 'SLEEP', ['SLEEP', 'EAT LUNCH AT SCHOOL', 'SEE THE SUN HIGH'], { speak: 'I sleep at night' }),
      ]),
    ],
  },
  {
    id: 'english-speak',
    title: "Let's Speak English",
    subtitle: 'Frases, diálogos y primeras lecturas',
    icon: '💬',
    lessons: [
      lesson('What is it?', 'Identificar un objeto por su nombre.', 'en-vocabulario', 'Look, listen, choose the word.', [
        choice('What is it? 🐱', 'A CAT', ['A CAT', 'A BOOK', 'A SHOE'], { speak: 'What is it? It is a cat.', image: '🐱' }),
        choice('What is it? 🍎', 'AN APPLE', ['AN APPLE', 'A DOG', 'A HAT'], { speak: 'It is an apple.', image: '🍎' }),
        choice('What is it? 📚', 'A BOOK', ['A BOOK', 'A FISH', 'MILK'], { speak: 'It is a book.', image: '📚' }),
        choice('“It is a dog.” The word dog names…', 'AN ANIMAL', ['AN ANIMAL', 'A COLOR', 'A NUMBER'], { speak: 'It is a dog.' }),
      ]),
      lesson('Build the sentence', 'Ordenar palabras que ya conoces.', 'en-frase', 'Capital letter first.', [
        order('Make the sentence.', ['cat', 'The', 'is', 'small'], 'The cat is small', { speak: 'The cat is small' }),
        order('Make the sentence.', ['apple', 'red', 'a', 'is', 'It'], 'It is a red apple', { speak: 'It is a red apple' }),
        order('Make the question.', ['you?', 'are', 'How'], 'How are you?', { speak: 'How are you?' }),
        order('Make the sentence.', ['to', 'go', 'I', 'school'], 'I go to school', { speak: 'I go to school' }),
      ]),
      lesson('Complete the dialogue', 'Elegir la respuesta que encaja.', 'en-dialogo', 'Read both lines.', [
        choice('A: Hello! B: ___', 'HELLO', ['HELLO', 'APPLE', 'SEVEN'], { speak: 'Hello' }),
        choice('A: How are you? B: ___', 'I AM FINE', ['I AM FINE', 'IT IS A CHAIR', 'BLUE DOG'], { speak: 'How are you?' }),
        choice('A: What is this? B: ___', 'IT IS A BOOK', ['IT IS A BOOK', 'GOODBYE WATER', 'I AM FIVE CATS'], { speak: 'What is this?' }),
        choice('A: Thank you. B: ___', 'YOU ARE WELCOME', ['YOU ARE WELCOME', 'I AM A HAT', 'RED PLEASE'], { speak: 'Thank you' }),
      ]),
      lesson('My first English story', 'Comprender tres ideas de un cuento mínimo.', 'en-lectura', 'You can listen again.', [
        choice('Luna has a cat. The cat is small. What does Luna have?', 'A CAT', ['A CAT', 'A BUS', 'A HAT'], { speak: 'Luna has a cat. The cat is small.' }),
        choice('The cat is small. Small means…', 'LITTLE', ['LITTLE', 'VERY BIG', 'A COLOR'], { speak: 'The cat is small' }),
        choice('They play at home. Where do they play?', 'AT HOME', ['AT HOME', 'ON THE MOON', 'IN THE SEA'], { speak: 'They play at home' }),
        choice('The story is about…', 'LUNA AND HER CAT', ['LUNA AND HER CAT', 'A MATH TEST', 'THE RAIN ONLY'], { speak: 'Luna has a cat' }),
      ]),
      lesson('Read a short phrase', 'Leer palabras ya escuchadas.', 'en-lectura', 'Match the written phrase.', [
        choice('Which phrase means hola?', 'HELLO', ['HELLO', 'GOOD NIGHT FOOD', 'FIVE APPLES'], { speak: 'hello' }),
        choice('Which phrase means gracias?', 'THANK YOU', ['THANK YOU', 'BLUE DOG', 'I RUN TO THE MOON'], { speak: 'thank you' }),
        choice('“I see a red apple.” The apple is…', 'RED', ['RED', 'BLUE', 'A DOG'], { speak: 'I see a red apple' }),
        choice('Choose the real English sentence.', 'THE DOG IS BROWN', ['THE DOG IS BROWN', 'DOG BROWN IS THE RUNNING MOON', 'PLEASE NUMBER COLOR'], { speak: 'The dog is brown' }),
      ]),
    ],
  },
]

export const ENGLISH_SKILL_TITLES: Record<string, string> = {
  'en-saludo': 'Saludar en inglés',
  'en-nombre': 'Decir el nombre',
  'en-estado': 'Decir cómo estás',
  'en-cortesia': 'Please y thank you',
  'en-dialogo': 'Completar un diálogo',
  'en-color': 'Reconocer colores',
  'en-shape': 'Nombrar formas',
  'en-instruccion': 'Seguir una instrucción',
  'en-familia': 'Nombrar a la familia',
  'en-cuerpo': 'Partes del cuerpo',
  'en-emocion': 'Decir una emoción',
  'en-describir': 'Describir con una frase',
  'en-animal': 'Nombrar animales',
  'en-habitat-en': 'Decir dónde vive',
  'en-clima': 'Hablar del tiempo',
  'en-naturaleza': 'Palabras de la naturaleza',
  'en-numero': 'Contar en inglés',
  'en-comida': 'Nombrar comidas',
  'en-lugar-en': 'Casa y escuela',
  'en-ropa': 'Nombrar ropa',
  'en-rutina': 'Contar la rutina',
  'en-vocabulario': 'Reconocer una palabra',
  'en-frase': 'Ordenar una frase',
  'en-lectura': 'Leer una frase corta',
}

export const ENGLISH_PACK = packSubject('english', worlds, ENGLISH_SKILL_TITLES)
