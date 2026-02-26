import { useState, useRef, useEffect } from "react";
// Parlami v4
import { Send, BookOpen, LogOut, X, CheckCircle, XCircle, Users, ChevronRight, Star } from "lucide-react";
const TEACHER_PW = "Teacher2026";
const LEVEL_REQ = { A1:1000, A2:2000, B1:3500, B2:5500, C1:8000, C2:12000 };
const LEVELS = ["A1","A2","B1","B2","C1","C2"];
const LC = l => ({A1:"#22c55e",A2:"#84cc16",B1:"#eab308",B2:"#f97316",C1:"#ef4444",C2:"#a855f7"}[l]||"#22c55e");
const LN = l => ({A1:"Beginner",A2:"Elementary",B1:"Intermediate",B2:"Upper Int.",C1:"Advanced",C2:"Mastery"}[l]||"Beginner");
const cx = {
card:"bg-white rounded-2xl border border-gray-100 p-4",
modal:"fixed inset-0 flex items-center justify-center z-50",
overlay:{background:"rgba(0,0,0,0.4)"},
input:"w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400",
btn:"w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40",
row:"flex items-center justify-between",
xs4:"text-xs text-gray-400",
};
const BADGES = [
{id:"first_steps",name:"First Steps",icon:"🎯",req:1,type:"messages",desc:"Send your first message"},
{id:"chatterbox",name:"Chatterbox",icon:"💬",req:100,type:"messages",desc:"Send 100 messages"},
{id:"dedicated",name:"Dedicated",icon:"⭐",req:500,type:"messages",desc:"Send 500 messages"},
{id:"streak7",name:"7-Day Streak",icon:"🔥",req:7,type:"streak",desc:"Practice 7 days in a row"},
{id:"streak30",name:"30-Day Streak",icon:"🌟",req:30,type:"streak",desc:"Practice 30 days in a row"},
{id:"explorer",name:"Explorer",icon:"📖",req:100,type:"vocab",desc:"Use 100 Italian words"},
{id:"wordmaster",name:"Word Master",icon:"📚",req:1000,type:"vocab",desc:"Use 1,000 Italian words"},
{id:"polyglot",name:"Polyglot",icon:"🌍",req:3,type:"tests",desc:"Pass 3 level tests"},
];
const TESTS = {
A1:{title:"A1 – Beginner",qs:[
{q:"What does 'buongiorno' mean?",a:["good morning"]},
{q:"What is 'the house' in Italian?",a:["la casa"]},
{q:"Fill in: 'Io ___ Mario.' (essere)",a:["sono"]},
{q:"Translate: 'I am a student.'",a:["sono uno studente","sono una studentessa"]},
{q:"What number is 'quindici'?",a:["15","fifteen"]},
{q:"What does 'Come ti chiami?' mean?",a:["what is your name","what are you called"]},
{q:"Translate: 'I live in Rome.'",a:["abito a roma","vivo a roma"]},
{q:"What is 'the book' in Italian?",a:["il libro"]},
{q:"Fill in: 'Lei ___ italiana.' (essere)",a:["e","è"]},
{q:"What does 'per favore' mean?",a:["please"]},
{q:"Translate: 'How old are you?'",a:["quanti anni hai"]},
{q:"What is 'the dog' in Italian?",a:["il cane"]},
{q:"Fill in: 'Noi ___ il caffe.' (bere)",a:["beviamo"]},
{q:"What does 'dove' mean?",a:["where"]},
{q:"Translate: 'Good evening.'",a:["buonasera"]},
{q:"What is the plural of 'il libro'?",a:["i libri"]},
{q:"What does 'quanto costa?' mean?",a:["how much does it cost","how much is it"]},
{q:"Fill in: 'Tu ___ a scuola.' (andare)",a:["vai"]},
{q:"What does 'arrivederci' mean?",a:["goodbye","see you later"]},
{q:"What is 'the water' in Italian?",a:["l'acqua","lacqua"]},
{q:"Fill in: 'Loro ___ a casa.' (stare)",a:["stanno"]},
{q:"What does 'capire' mean?",a:["to understand"]},
{q:"Translate: 'I don't understand.'",a:["non capisco"]},
{q:"What does 'quando' mean?",a:["when"]},
{q:"Fill in: 'Io ___ fame.' (avere)",a:["ho"]},
{q:"Translate: 'Nice to meet you.'",a:["piacere"]},
{q:"What does 'sempre' mean?",a:["always"]},
{q:"What is 'the cat' in Italian?",a:["il gatto"]},
{q:"What does 'grazie' mean?",a:["thank you","thanks"]},
{q:"Fill in: 'Voi ___ studenti.' (essere)",a:["siete"]},
{q:"What is 'the school' in Italian?",a:["la scuola"]},
{q:"What does 'mangiare' mean?",a:["to eat"]},
{q:"Fill in: 'Io mi ___ Luca.' (chiamarsi)",a:["chiamo"]},
{q:"Translate: 'I am hungry.'",a:["ho fame"]},
{q:"What does 'parlare' mean?",a:["to speak","to talk"]},
{q:"What is 'the train' in Italian?",a:["il treno"]},
{q:"What does 'oggi' mean?",a:["today"]},
{q:"What does 'domani' mean?",a:["tomorrow"]},
{q:"Translate: 'Excuse me.'",a:["scusi","scusa"]},
{q:"What does 'dormire' mean?",a:["to sleep"]},
{q:"Fill in: 'Lui ___ molto.' (lavorare)",a:["lavora"]},
{q:"Translate: 'I am tired.'",a:["sono stanco","sono stanca"]},
{q:"What does 'subito' mean?",a:["immediately","right away"]},
{q:"What is the Italian for 'Monday'?",a:["lunedi","lunedì"]},
{q:"Translate: 'How are you?'",a:["come stai","come sta"]},
{q:"What is 'the bread' in Italian?",a:["il pane"]},
{q:"What does 'caldo' mean?",a:["hot","warm"]},
{q:"What does 'studiare' mean?",a:["to study"]},
{q:"What is 'the mother' in Italian?",a:["la madre","la mamma"]},
{q:"Translate: 'Good night.'",a:["buonanotte"]},
]},
A2:{title:"A2 – Elementary",qs:[
{q:"Come si dice 'tired' (maschile)?",a:["stanco"]},
{q:"Completa: 'Ieri ___ al cinema.' (andare)",a:["sono andato","sono andata"]},
{q:"Quale ausiliare si usa con 'partire'?",a:["essere"]},
{q:"Completa: 'Lui studia italiano ___ tre anni.'",a:["da"]},
{q:"Completa: 'Mentre ___ leggevo.' (piovere)",a:["pioveva"]},
{q:"Come si dice 'I got dressed'?",a:["mi sono vestito","mi sono vestita"]},
{q:"Quale preposizione: 'Vado ___ scuola'?",a:["a"]},
{q:"Completa: 'Lui ___ cucinare bene.' (sapere)",a:["sa"]},
{q:"Completa: 'Prima di uscire, ___ le chiavi.' (prendere, io)",a:["ho preso"]},
{q:"Completa: 'Mi ___ molto il cinema.' (piacere)",a:["piace"]},
{q:"Completa: 'Ieri sera ___ tardi.' (tornare, noi)",a:["siamo tornati","siamo tornate"]},
{q:"Come si dice 'sometimes'?",a:["a volte","qualche volta"]},
{q:"Traduci: 'Can you repeat that please?'",a:["puo ripetere","puoi ripetere"]},
{q:"Quale articolo: '___ zaino'?",a:["lo"]},
{q:"Traduci: 'I was eating when the phone rang.'",a:["stavo mangiando quando il telefono ha squillato","mangiavo quando il telefono squillava"]},
{q:"Come si dice 'I feel like going out'?",a:["ho voglia di uscire"]},
{q:"Completa: 'Lui ___ in banca.' (lavorare, imperfetto)",a:["lavorava"]},
{q:"Come si dice 'I have to go'?",a:["devo andare"]},
{q:"Traduci: 'She woke up late this morning.'",a:["si e svegliata tardi stamattina"]},
{q:"Quale passato si usa per un'azione abituale nel passato?",a:["imperfetto"]},
{q:"Come si dice 'the day before yesterday'?",a:["l'altro ieri"]},
{q:"Quale articolo: '___ studente'?",a:["lo"]},
{q:"Traduci: 'I prefer tea to coffee.'",a:["preferisco il te al caffe","preferisco il tè al caffè"]},
{q:"Come si chiama il tempo usato per descrivere nel passato?",a:["imperfetto"]},
{q:"Come si dice 'I haven't seen him in a week'?",a:["non lo vedo da una settimana"]},
{q:"Completa: 'Quando ___ piccola, amavo il mare.' (essere, io)",a:["ero"]},
{q:"Come si dice 'to get up' in Italian?",a:["alzarsi"]},
{q:"Traduci: 'We arrived home at midnight.'",a:["siamo arrivati a casa a mezzanotte"]},
{q:"Completa: 'Voi ___ mai in Francia?' (essere)",a:["siete stati","siete state"]},
{q:"Quale modo si usa dopo 'volere che'?",a:["congiuntivo"]},
{q:"Come si dice 'I am bored'?",a:["mi annoio","sono annoiato","sono annoiata"]},
{q:"Come si dice 'next week'?",a:["la settimana prossima"]},
{q:"Come si dice 'half past three'?",a:["le tre e mezza"]},
{q:"Come si dice 'it's raining'?",a:["piove","sta piovendo"]},
{q:"Traduci: 'I have never tried sushi.'",a:["non ho mai provato il sushi"]},
{q:"Traduci: 'My sister is taller than me.'",a:["mia sorella e piu alta di me"]},
{q:"Come si dice 'two weeks ago'?",a:["due settimane fa"]},
{q:"Traduci: 'I finished the homework an hour ago.'",a:["ho finito i compiti un'ora fa"]},
{q:"Come si dice 'I am sorry'?",a:["mi dispiace","scusa"]},
{q:"Come si dice 'on the right'?",a:["a destra"]},
{q:"Traduci: 'I used to play football every Sunday.'",a:["giocavo a calcio ogni domenica"]},
{q:"Come si dice 'I changed my mind'?",a:["ho cambiato idea"]},
{q:"Quale preposizione: 'Sono ___ vacanza'?",a:["in"]},
{q:"Traduci: 'He has already left.'",a:["e gia partito"]},
{q:"Come si dice 'to fall asleep'?",a:["addormentarsi"]},
{q:"Quale preposizione: 'Ho bisogno ___ dormire'?",a:["di"]},
{q:"Traduci: 'I have a headache.'",a:["ho mal di testa"]},
{q:"Come si dice 'to get married'?",a:["sposarsi"]},
{q:"Quale ausiliare con 'svegliarsi'?",a:["essere"]},
{q:"Come si dice 'the day after tomorrow'?",a:["dopodomani"]},
]},
B1:{title:"B1 – Intermedio",qs:[
{q:"Completa: 'Penso che lui ___ ragione.' (congiuntivo)",a:["abbia"]},
{q:"Completa: 'Se avessi tempo, ___ di piu.' (viaggiare)",a:["viaggerei"]},
{q:"Che modo verbale dopo 'prima che'?",a:["congiuntivo"]},
{q:"Traduci: 'Although it was raining, we went out.'",a:["nonostante piovesse siamo usciti","sebbene piovesse siamo usciti"]},
{q:"Completa: 'Spero che tu ___ presto.' (guarire)",a:["guarisca"]},
{q:"Completa: 'Non credo che ___ possibile.' (essere)",a:["sia"]},
{q:"Differenza tra 'sapere' e 'conoscere'?",a:["sapere fatti e abilita, conoscere persone e luoghi"]},
{q:"Traduci: 'I wish I could come to the party.'",a:["magari potessi venire alla festa","vorrei poter venire alla festa"]},
{q:"Come si forma il congiuntivo imperfetto di 'essere'?",a:["fossi fosse fossimo foste fossero"]},
{q:"Che differenza c'e tra passato prossimo e imperfetto?",a:["passato prossimo azione completata, imperfetto azione in corso o abituale"]},
{q:"Completa: 'Vuole che io ___ la verita.' (dire)",a:["dica"]},
{q:"Completa: 'Benche ___ difficile, ce l'abbiamo fatta.' (essere)",a:["fosse"]},
{q:"Completa: 'Si dice che Roma ___ bella.' (essere)",a:["sia"]},
{q:"Traduci: 'I had already eaten when she arrived.'",a:["avevo gia mangiato quando e arrivata"]},
{q:"Quale modo dopo 'a meno che'?",a:["congiuntivo"]},
{q:"Completa: 'Vorrei che tu ___ piu attento.' (stare)",a:["stessi"]},
{q:"Completa: 'E il posto piu bello ___ abbia mai visto.'",a:["che"]},
{q:"Completa: 'Lui mi ha chiesto se ___ venire.' (potere, io)",a:["potevo","potessi"]},
{q:"Cos'e il trapassato prossimo? Fai un esempio.",a:["azione anteriore a un'altra nel passato, avevo mangiato quando e arrivato"]},
{q:"Completa: 'Nonostante ___ malato, e andato a lavorare.' (essere)",a:["fosse"]},
{q:"Quale ausiliare con 'piacere'?",a:["essere"]},
{q:"Traduci: 'I have been waiting for an hour.'",a:["aspetto da un'ora","sto aspettando da un'ora"]},
{q:"Completa: 'Se ___ prima, avrei preso il treno.' (partire, io)",a:["fossi partito","fossi partita"]},
{q:"Che tempo si usa per un'azione futura dopo 'quando' in italiano?",a:["futuro semplice"]},
{q:"Completa: 'E ora che tu ___ una decisione.' (prendere)",a:["prenda"]},
{q:"Completa: 'Avrei voluto ___ ma non ho potuto.' (venire)",a:["venire"]},
{q:"Traduci: 'She seems to be tired.'",a:["sembra stanca","sembra che sia stanca"]},
{q:"Come si dice 'to manage to do something'?",a:["riuscire a fare qualcosa"]},
{q:"Quale modo dopo 'benche'?",a:["congiuntivo"]},
{q:"Traduci: 'I would have come if I had known.'",a:["sarei venuto se avessi saputo","sarei venuta se avessi saputo"]},
{q:"Come si usa 'stare + gerundio'?",a:["per indicare un'azione in corso, sto studiando"]},
{q:"Cosa significa 'farcela'?",a:["to manage, to make it, riuscire"]},
{q:"Traduci: 'He pretends not to understand.'",a:["finge di non capire"]},
{q:"Come si forma il condizionale di 'andare'?",a:["andrei andresti andrebbe andremmo andreste andrebbero"]},
{q:"Cosa indica 'gia' nel passato prossimo?",a:["che l'azione e gia avvenuta, already"]},
{q:"Come si dice 'I can't stand it anymore'?",a:["non ce la faccio piu","non ne posso piu"]},
{q:"Quale modo con 'a condizione che'?",a:["congiuntivo"]},
{q:"Traduci: 'I hope you feel better soon.'",a:["spero che tu ti senta meglio presto"]},
{q:"Come si dice 'to be worth it'?",a:["valere la pena"]},
{q:"Spiega la differenza tra 'ma' e 'pero'.",a:["simili ma pero viene dopo la virgola o a inizio frase con piu enfasi"]},
{q:"Come si dice 'after all'?",a:["dopotutto","in fondo"]},
{q:"Quale preposizione: 'Sono bravo ___ cucinare'?",a:["a"]},
{q:"Come si dice 'I'm looking forward to it'?",a:["non vedo l'ora"]},
{q:"Quale preposizione: 'Penso ___ te'?",a:["a"]},
{q:"Come si dice 'to take advantage of'?",a:["approfittare di"]},
{q:"Spiega la differenza tra 'ancora' e 'piu'.",a:["non ancora = not yet, non piu = no longer"]},
{q:"Traduci: 'The longer you wait, the worse it gets.'",a:["piu aspetti peggio e"]},
{q:"Come si dice 'as soon as possible'?",a:["il prima possibile"]},
{q:"Completa: 'Ho smesso ___ fumare.' (di)",a:["di"]},
{q:"Completa: 'E meglio che tu ___ adesso.' (andare)",a:["vada"]},
]},
B2:{title:"B2 – Int. Superiore",qs:[
{q:"Completa: 'Se ___ la verita, avrei agito diversamente.' (sapere)",a:["avessi saputo"]},
{q:"Correggi: 'Nonostante ha lavorato tanto.'",a:["nonostante avesse lavorato tanto"]},
{q:"Che modo con 'sebbene' e 'benche'?",a:["congiuntivo"]},
{q:"Traduci: 'I wish things were different.'",a:["magari le cose fossero diverse","vorrei che le cose fossero diverse"]},
{q:"'attuale' vs 'actual'?",a:["attuale significa corrente non reale, e un falso amico"]},
{q:"Cos'e un 'gerundio composto'? Esempio.",a:["avendo mangiato, essendo partito"]},
{q:"Correggi: 'E importante che tutti capiscono la regola.'",a:["capiscano"]},
{q:"Spiega il periodo ipotetico di terzo tipo.",a:["se avessi fatto avrei fatto, ipotesi impossibile nel passato"]},
{q:"Differenza stilistica tra 'disse' e 'ha detto'.",a:["disse e passato remoto letterario, ha detto e parlato"]},
{q:"Traduci: 'The report must have been submitted by now.'",a:["il rapporto deve essere stato consegnato ormai"]},
{q:"Cosa sono i 'falsi amici'? Fai un esempio.",a:["parole simili con significato diverso, es attuale, libreria, annoiato"]},
{q:"Forma il futuro anteriore: 'Quando ___, ti chiamo.' (finire, io)",a:["avro finito"]},
{q:"Cosa indica il modo condizionale passato?",a:["azione che sarebbe avvenuta nel passato ma non e avvenuta"]},
{q:"Spiega la differenza tra 'ne' e 'ci'.",a:["ne sostituisce di + qualcosa, ci sostituisce a/in + luogo o cosa"]},
{q:"Correggi: 'Esco malgrado piove.'",a:["malgrado piova","malgrado piovesse"]},
{q:"Come si forma il passivo con 'venire'? Esempio.",a:["soggetto + venire coniugato + participio passato, il libro viene letto"]},
{q:"Traduci: 'He denied having stolen the money.'",a:["ha negato di aver rubato i soldi"]},
{q:"Cos'e la 'concordanza dei tempi' al congiuntivo?",a:["il tempo del congiuntivo dipende dal tempo della reggente"]},
{q:"Traduci: 'Whatever happens, don't panic.'",a:["qualunque cosa accada non farti prendere dal panico"]},
{q:"Spiega il costrutto 'stare per + infinito'.",a:["indica un'azione imminente, stava per piovere"]},
{q:"Cos'e il discorso indiretto? Trasforma: 'Vengo domani.'",a:["ha detto che sarebbe venuto il giorno dopo"]},
{q:"Traduci: 'The fact that he arrived late annoyed everyone.'",a:["il fatto che sia arrivato tardi ha infastidito tutti"]},
{q:"Come si usa 'pur' + gerundio?",a:["valore concessivo, pur sapendo la verita ha taciuto"]},
{q:"Traduci formalmente: 'We regret to inform you that...'",a:["siamo spiacenti di comunicarle che"]},
{q:"Cos'e la nominalizzazione? Fai un esempio.",a:["trasformare una frase in un sintagma nominale, il fatto che piovesse = la pioggia"]},
{q:"Cosa indica il futuro anteriore? Esempio.",a:["azione futura completata prima di un'altra, quando avro finito usciro"]},
{q:"Traduci: 'She can't have left already.'",a:["non puo essere gia partita"]},
{q:"Spiega 'andare + participio passato'. Esempio.",a:["passivo con senso di necessita, va fatto, va rispettato"]},
{q:"Cos'e la 'perifrasi verbale'? Esempio.",a:["costrutto di piu verbi, stare per partire"]},
{q:"Traduci: 'The meeting has been postponed.'",a:["la riunione e stata rinviata","la riunione e stata posticipata"]},
{q:"Quale registro si usa in una lettera formale?",a:["formale, con lei e forme di cortesia"]},
{q:"Spiega 'andare + participio'. Quando si usa?",a:["passivo con senso di obbligo, va fatto, va detto"]},
{q:"Traduci: 'Assuming that the plan works...'",a:["ammesso che il piano funzioni","supponendo che il piano funzioni"]},
{q:"Come si dice 'to take for granted'?",a:["dare per scontato"]},
{q:"Traduci: 'The sooner the better.'",a:["prima e meglio e","quanto prima tanto meglio"]},
{q:"Spiega la differenza tra 'ciononostante' e 'tuttavia'.",a:["sinonimi formali, ciononostante piu letterario"]},
{q:"Traduci: 'I can't help thinking about it.'",a:["non posso fare a meno di pensarci"]},
{q:"Come si forma il superlativo assoluto?",a:["aggiungendo -issimo, bellissimo grandissimo"]},
{q:"Traduci: 'He made us wait for an hour.'",a:["ci ha fatto aspettare un'ora"]},
{q:"Cos'e il modo infinito passato? Esempio.",a:["aver mangiato, essere partito, azione anteriore"]},
{q:"Traduci: 'By the time I arrived, he had already left.'",a:["quando sono arrivato, era gia partito"]},
{q:"Spiega il costrutto 'venire + participio'. Quando si usa?",a:["passivo con venire indica azione in corso o ripetuta"]},
{q:"Traduci: 'I am used to getting up early.'",a:["sono abituato ad alzarmi presto"]},
{q:"Cosa sono le 'congiunzioni avversative'? Esempi.",a:["ma pero tuttavia bensi al contrario"]},
{q:"Traduci: 'She is said to be very talented.'",a:["si dice che sia molto brava"]},
{q:"Come si dice 'to make up one's mind'?",a:["decidersi"]},
{q:"Traduci: 'The more you practice, the better you get.'",a:["piu pratichi meglio diventi"]},
{q:"Cos'e l'accordo del participio passato con i pronomi diretti?",a:["il participio si accorda col pronome, l'ho vista, le ho viste"]},
]},
C1:{title:"C1 – Avanzato",qs:[
{q:"Completa: 'Chiunque ___ partecipare deve iscriversi.' (volere)",a:["voglia"]},
{q:"Errore: 'Malgrado fosse stanco, tuttavia continuo.'",a:["tuttavia e ridondante con malgrado"]},
{q:"Correggi: 'E importante che tutti capiscono.'",a:["capiscano"]},
{q:"Cos'e il Risorgimento?",a:["movimento per l'unificazione d'italia"]},
{q:"Nominalizzazione: 'Le emissioni sono aumentate, questo preoccupa.'",a:["l'aumento delle emissioni preoccupa"]},
{q:"Cos'e il 'discorso indiretto libero'? Esempio.",a:["la voce del narratore si fonde con quella del personaggio"]},
{q:"Traduci con registro formale: 'We would like to inform you that...'",a:["siamo a comunicarle che","desideriamo informarla che"]},
{q:"Differenza tra 'siccome' e 'poiche'.",a:["siccome introduce la causa prima dell'effetto, poiche e piu flessibile"]},
{q:"Forma un esempio di costruzione assoluta con il participio.",a:["finita la riunione siamo usciti"]},
{q:"Cos'e l'iperbato? Esempio letterario.",a:["inversione dell'ordine naturale delle parole"]},
{q:"Traduci in italiano formale: 'This matter requires urgent attention.'",a:["questa questione richiede un'attenzione urgente"]},
{q:"Spiega l'uso di 'pur' + gerundio.",a:["concessivo, pur sapendo la verita ha taciuto"]},
{q:"Cos'e la 'questione della lingua' nel Cinquecento?",a:["dibattito sulla lingua letteraria italiana tra latino toscano e volgare"]},
{q:"Cos'e la 'Commedia dell'Arte'?",a:["forma di teatro improvvisato con maschere fisse del rinascimento italiano"]},
{q:"Spiega il costrutto 'fare + infinito'. Esempio.",a:["causativo, fa mangiare il bambino, lo fa lavorare"]},
{q:"Traduci: 'The fact that he lied is unforgivable.'",a:["il fatto che abbia mentito e imperdonabile"]},
{q:"Cos'e il congiuntivo ottativo? Esempio.",a:["esprime un desiderio, magari venisse, che tu possa riuscire"]},
{q:"Spiega 'andare + participio passato'. Esempio.",a:["passivo con senso di necessita, va fatto, va rispettato"]},
{q:"Cos'e la 'clitica raddoppiata'? Esempio.",a:["il clitico si ripete anche quando c'e il nome, a mario glielo dico"]},
{q:"Differenza tra 'qualora' e 'nel caso in cui'.",a:["sinonimi, entrambi reggono il congiuntivo, qualora e piu formale"]},
{q:"Cos'e la 'metalessi'? Esempio.",a:["figura retorica che sostituisce causa con effetto, bevo la mia rovina"]},
{q:"Spiega la differenza tra 'tuttavia' e 'eppure'.",a:["entrambi avversativi ma eppure ha valore piu sorpreso e enfatico"]},
{q:"Traduci con eleganza: 'The silence was deafening.'",a:["il silenzio era assordante"]},
{q:"Cos'e la 'sineddoche'? Esempio.",a:["parte per il tutto o viceversa, ho comprato una ruota = una macchina"]},
{q:"Cos'e il 'Verismo'? Autore principale.",a:["realismo letterario italiano fine ottocento, Giovanni Verga"]},
{q:"Cos'e l'anastrofe? Differenza con l'iperbato.",a:["anastrofe inverte due elementi adiacenti, iperbato separa elementi correlati"]},
{q:"Traduci: 'It is high time you made a decision.'",a:["e ora che tu prenda una decisione"]},
{q:"Spiega il valore del congiuntivo nella frase relativa.",a:["indica caratteristiche ipotetiche o indefinite, cerco qualcuno che sappia parlare"]},
{q:"Cos'e la 'litote'? Esempio.",a:["negazione dell'opposto per affermare, non e stupido = e intelligente"]},
{q:"Cos'e il 'Futurismo'? Fondatore.",a:["movimento artistico avanguardista del novecento, Filippo Tommaso Marinetti"]},
{q:"Cos'e la 'prolessi'? Esempio.",a:["anticipazione di un elemento, la pizza la mangio volentieri"]},
{q:"Cos'e il 'Decadentismo'? Caratteristiche.",a:["movimento letterario fine ottocento, estetismo, pessimismo, D'Annunzio Pascoli"]},
{q:"Cos'e l'Ermetismo? Poeta principale.",a:["poesia oscura e simbolica del novecento, Giuseppe Ungaretti Eugenio Montale"]},
{q:"Spiega il costrutto impersonale 'si dice che'. Quale modo?",a:["si dice che + congiuntivo, si dice che sia partito"]},
{q:"Cos'e il 'Crepuscolarismo'?",a:["corrente poetica inizio novecento, toni dimessi e malinconici, Gozzano Corazzini"]},
{q:"Cos'e il 'de vulgari eloquentia' di Dante?",a:["trattato in latino sulla lingua volgare illustre e sulla poesia italiana"]},
{q:"Spiega la differenza tra 'ironia' e 'sarcasmo' in stilistica.",a:["ironia dice il contrario con leggerezza, sarcasmo e piu tagliente e offensivo"]},
{q:"Cos'e il 'Manifesto degli intellettuali antifascisti' del 1925?",a:["documento redatto da Benedetto Croce contro il fascismo"]},
{q:"Cos'e l'enjambement nella poesia italiana?",a:["il senso della frase scavalca il limite del verso, creando tensione ritmica"]},
{q:"Spiega il concetto di 'mimesi' in Aristotele.",a:["imitazione della realta come principio artistico, rielaborato dal Rinascimento italiano"]},
{q:"Spiega la 'reticenza' come figura retorica.",a:["interruzione della frase per suggerire cio che non si vuole dire"]},
{q:"Cos'e la 'catachresi'?",a:["uso metaforico di una parola che ha perso il senso originale, il collo della bottiglia"]},
{q:"Spiega il valore di 'mica' nella negazione.",a:["rafforza la negazione con senso di sorpresa, non lo sapevo mica"]},
{q:"Spiega il costrutto 'lasciare + infinito'.",a:["permissivo, lascialo parlare, lascia fare quello che vuole"]},
{q:"Cos'e la 'perifrasi eufemistica'? Esempio.",a:["espressione indiretta per evitare parola diretta, e venuto a mancare = e morto"]},
{q:"Spiega la 'paratassi affettiva' nel parlato.",a:["coordinazione di frasi semplici per enfasi emotiva tipica del registro colloquiale"]},
{q:"Spiega il costrutto 'venire a + infinito'. Esempio.",a:["venire a sapere, venire a conoscenza, indica l'acquisizione di informazione"]},
{q:"Spiega la 'concinnitas' nella prosa classica.",a:["equilibrio e armonia nella struttura della frase, ricercata nel ciceronianismo"]},
]},
C2:{title:"C2 – Padronanza",qs:[
{q:"Figura retorica: 'Il vento urlava tra i rami.'",a:["personificazione"]},
{q:"'seppure' vs 'anche se': differenza stilistica?",a:["seppure e piu letterario e formale"]},
{q:"Questione della lingua: tre autori chiave.",a:["dante bembo manzoni"]},
{q:"Tre cantiche della Divina Commedia.",a:["inferno purgatorio paradiso"]},
{q:"Traduci con eleganza: 'Memory does not claim objectivity.'",a:["la memoria non pretende l'oggettivita"]},
{q:"Cos'e il 'chiasmo'? Fai un esempio.",a:["incrocio sintattico abba, vivo senz'anima e muoio senza vita"]},
{q:"Spiega il 'dolce stil novo'.",a:["corrente poetica duecento, dante cavalcanti, donna angelicata e amore elevazione spirituale"]},
{q:"Differenza tra 'anacoluto' e 'solecismo'.",a:["anacoluto e rottura sintattica voluta, solecismo e errore grammaticale"]},
{q:"Cos'e il 'verismo'? Autore principale.",a:["movimento letterario realista italiano fine ottocento, verga"]},
{q:"Figura retorica: 'Era bello come il sole e freddo come il ghiaccio.'",a:["similitudine"]},
{q:"Spiega il costrutto latineggiante del participio assoluto in italiano letterario.",a:["participio + soggetto proprio, giunto il messaggero il re si alzo"]},
{q:"Cos'e l'Ermetismo? Poeta principale.",a:["corrente poetica oscura e simbolica, ungaretti montale quasimodo"]},
{q:"Analisi: 'Tanto gentile e tanto onesta pare.' — metro.",a:["endecasillabo, dante vita nuova"]},
{q:"Differenza tra 'zeugma' e 'sillepsi'.",a:["zeugma unisce elementi sintatticamente, sillepsi li unisce semanticamente"]},
{q:"Cos'e il 'Canzoniere' di Petrarca?",a:["raccolta di sonetti dedicati a laura, fondamento della lirica europea"]},
{q:"Traduci in italiano letterario: 'The stars were indifferent to human grief.'",a:["le stelle erano indifferenti al dolore umano"]},
{q:"Cos'e il 'Neorealismo' italiano?",a:["movimento letterario e cinematografico del dopoguerra, pavese calvino visconti"]},
{q:"Analisi stilistica: 'A Silvia' di Leopardi — tema principale.",a:["illusione giovanile e morte precoce, contrasto speranza e realta"]},
{q:"Cos'e il 'Decameron' e qual e la sua struttura?",a:["cento novelle di boccaccio raccontate da dieci giovani in dieci giorni"]},
{q:"Spiega la differenza tra 'metafora' e 'allegoria'.",a:["metafora sostituzione puntuale, allegoria metafora estesa a tutto un testo"]},
{q:"Cos'e la 'captatio benevolentiae'?",a:["apertura retorica per conquistare il favore del pubblico"]},
{q:"Analisi: verso libero vs endecasillabo.",a:["endecasillabo 11 sillabe con accento fisso, verso libero nessuno schema metrico fisso"]},
{q:"Cos'e il 'Futurismo'? Manifesto principale.",a:["avanguardia novecentesca, Marinetti, manifesto del futurismo 1909"]},
{q:"Spiega l'ossimoro. Esempio da Petrarca.",a:["unione di termini contraddittori, pace non trovo e non ho da far guerra"]},
{q:"Analisi di 'L'Infinito' di Leopardi: tema e struttura.",a:["contemplazione e annullamento nell'infinito, quindici endecasillabi sciolti"]},
{q:"Spiega la differenza tra 'anadiplosi' e 'epanastrofe'.",a:["anadiplosi ripete la fine di una frase all'inizio della successiva"]},
{q:"Cos'e il 'Crepuscolarismo'? Autori.",a:["corrente poetica inizio novecento, toni dimessi e malinconici, Gozzano Corazzini"]},
{q:"Spiega la 'metalessi narrativa'. Esempio.",a:["il narratore entra nella storia o riconosce la finzione, come vedra il lettore"]},
{q:"Cos'e la 'catafora'? Differenza con 'anafora'.",a:["catafora anticipa l'elemento che verra dopo, anafora riprende quello gia detto"]},
{q:"Analisi: 'Meriggiare pallido e assorto' di Montale — poetica.",a:["male di vivere correlativo oggettivo paesaggio ligure, ossi di seppia"]},
{q:"Spiega il 'correlativo oggettivo' nella poetica di Montale.",a:["oggetti o situazioni concrete che evocano uno stato emotivo soggettivo"]},
{q:"Cos'e la 'parataxis'? Differenza con 'ipotaxis'.",a:["parataxis coordina le frasi, ipotaxis le subordina, ungaretti usa parataxis"]},
{q:"Spiega 'sprezzatura' nel contesto del Cortegiano di Castiglione.",a:["arte di sembrare naturale e senza sforzo in tutto cio che si fa"]},
{q:"Analisi: 'I Promessi Sposi' — funzione del narratore.",a:["narratore onnisciente ironico che si finge editore del manoscritto"]},
{q:"Spiega la 'teoria degli atti linguistici' di Austin e Searle.",a:["gli enunciati non solo descrivono ma compiono azioni, promesse ordini dichiarazioni"]},
{q:"Cos'e il 'romanzo storico'? Caratteristiche nell'Ottocento italiano.",a:["romanzo ambientato nel passato, manzoni i promessi sposi, storia e invenzione"]},
{q:"Spiega la differenza tra 'ekphrasis' e 'descriptio'.",a:["ekphrasis e descrizione vivida di un'opera d'arte, descriptio e descrizione generica"]},
{q:"Cos'e la 'diegesi' e come si differenzia da 'mimesi'?",a:["diegesi e narrazione di eventi, mimesi e rappresentazione diretta attraverso dialogo"]},
{q:"Cos'e la 'polifonia' nel romanzo moderno?",a:["pluralita di voci e punti di vista, bakhtin"]},
{q:"Spiega la differenza tra 'isotopia' e 'campo semantico'.",a:["isotopia e ricorrenza di tratti semantici nel testo, campo semantico e insieme di parole legate da significato"]},
{q:"Traduci con stile elevato: 'Time is the most democratic of tyrants.'",a:["il tempo e il piu democratico dei tiranni"]},
{q:"Cos'e la 'fabula' e come si distingue dall'intreccio?",a:["fabula e l'ordine cronologico degli eventi, intreccio e l'ordine narrativo del testo"]},
{q:"Spiega il concetto di 'langue' e 'parole' in Saussure.",a:["langue e il sistema astratto della lingua, parole e l'uso individuale concreto"]},
{q:"Cos'e la 'sinestesia'? Esempio dalla poesia italiana.",a:["associazione di sensazioni diverse, urlo nero di Ungaretti, voce di velluto"]},
{q:"Cos'e il 'locus amoenus' nella tradizione letteraria italiana?",a:["luogo ideale della natura, prato fonte ombra, da virgilio a boccaccio"]},
{q:"Spiega la struttura del sonetto petrarchesco.",a:["quattordici versi endecasillabi, due quartine e due terzine, schema abba abba cde cde"]},
{q:"Cos'e la 'quaestio de imitatione' nel Rinascimento?",a:["dibattito su quale modello seguire, Cicerone o stile eclettico"]},
{q:"Analisi stilistica: 'Uno, nessuno e centomila' di Pirandello — tema centrale.",a:["frammentazione dell'identita e relativita della persona sociale"]},
{q:"Spiega la funzione della 'narratio' nella struttura retorica classica.",a:["esposizione dei fatti nell'orazione, segue l'exordium"]},
{q:"Cos'e la 'contaminatio' nella letteratura?",a:["fusione di piu fonti o modelli in un unico testo"]},
{q:"Spiega il concetto di 'intertestualita' secondo Kristeva.",a:["ogni testo e una rete di riferimenti ad altri testi, assorbimento e trasformazione"]},
{q:"Cos'e la 'dispositio' nella retorica classica?",a:["l'organizzazione e la struttura dell'argomentazione nell'orazione"]},
{q:"Spiega la 'teoria della ricezione' di Jauss.",a:["il significato di un testo si realizza nell'incontro con il lettore e il suo orizzonte d'attesa"]},
{q:"Cos'e la 'diegesi eterodiegetica'?",a:["narratore esterno alla storia, in terza persona, non partecipa agli eventi"]},
{q:"Analisi: 'La coscienza di Zeno' di Svevo — tecnica narrativa.",a:["monologo interiore, narratore inattendibile, psicoanalisi come struttura"]},
{q:"Spiega la differenza tra 'tropo' e 'figura di pensiero'.",a:["tropo modifica il significato delle parole, figura di pensiero struttura i concetti"]},
{q:"Cos'e il 'pastiche' letterario?",a:["imitazione stilistica di un autore o genere a fini artistici o parodistici"]},
{q:"Spiega la 'focalizzazione' secondo Genette.",a:["il punto di vista da cui vengono percepiti gli eventi della narrazione"]},
{q:"Cos'e la 'elocutio' nella retorica classica?",a:["la scelta e l'organizzazione dello stile linguistico nell'orazione"]},
{q:"Spiega il concetto di 'defamiliarizzazione' di Sklovskij.",a:["rendere strano cio che e familiare, tecnica letteraria che rinnova la percezione"]},
{q:"Spiega la 'comunicazione fatica' in Jakobson.",a:["funzione del linguaggio per mantenere il contatto comunicativo"]},
{q:"Spiega la 'variazione diafasica' in linguistica.",a:["variazione linguistica in base alla situazione comunicativa e al registro"]},
{q:"Cos'e la 'prolepsi' narrativa?",a:["anticipazione di eventi futuri nel racconto, analessi ne e il contrario"]},
{q:"Spiega la differenza tra 'denotazione' e 'connotazione' nella semiotica.",a:["denotazione e il significato letterale, connotazione e il significato culturale o emotivo"]},
{q:"Cos'e la 'dialogicita' nel senso di Bachtin?",a:["ogni enunciato e in dialogo con altri enunciati passati e futuri"]},
{q:"Spiega il Naturalismo francese e come influenzo il Verismo.",a:["zola e la rappresentazione scientifica della realta, verga ne adatta i principi al contesto siciliano"]},
]},
};

const norm = s => s.toLowerCase().trim().replace(/[àáâã]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõ]/g,"o").replace(/[ùúûü]/g,"u").replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim();
const checkAns = (u,a) => { const n=norm(u); return a.some(x=>{ const nx=norm(x); if(n===nx||n.includes(nx)||nx.includes(n))return true; const aw=nx.split(" ").filter(w=>w.length>3),nw=n.split(" "); return aw.length>2&&aw.filter(w=>nw.includes(w)).length>=Math.ceil(aw.length*0.6); }); };
const hashPw = pw => { let h=0; for(let i=0;i<pw.length;i++){h=((h<<5)-h)+pw.charCodeAt(i);h|=0;} return "h"+Math.abs(h).toString(36); };
const Logo = ({size=48}) => (
<svg width={size} height={size} viewBox="0 0 80 80" fill="none">
<rect width="80" height="80" rx="20" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
<rect x="4" y="4" width="21" height="72" rx="6" fill="#009246"/>
<rect x="25" y="4" width="30" height="72" fill="white"/>
<rect x="55" y="4" width="21" height="72" rx="6" fill="#CE2B37"/>
<rect x="14" y="18" width="52" height="44" rx="10" fill="white" fillOpacity="0.97"/>
<text x="40" y="51" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="32" fill="#1a1a2e">P</text>
</svg>
);
async function callClaude(msgs, sys) {
const r = await fetch("/api/chat", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:sys,messages:msgs})});
const d = await r.json();
return d.text||"";
}
const PwInput = ({value,onChange,onEnter,placeholder,autoFocus}) => (
<input type="password" value={value} onChange={onChange} onKeyDown={e=>e.key==="Enter"&&onEnter?.()} placeholder={placeholder} autoFocus={autoFocus} className={cx.input}/>
);
function TestModal({level,onClose,onPass,onFail}) {
const test=TESTS[level];
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const [qs]=useState(()=>shuffle(test?.qs||[]).slice(0,30));
const [idx,setIdx]=useState(0);const [ans,setAns]=useState("");const [results,setResults]=useState([]);
const [fb,setFb]=useState(null);const [loading,setLoading]=useState(false);const [done,setDone]=useState(false);
if(!test) return <div className={cx.modal} style={cx.overlay}><div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl"><p className="text-2xl mb-3">🚧</p><button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm" style={{background:"#f3f4f6"}}>Close</button></div></div>;
const total=qs.length,q=qs[idx],score=results.filter(r=>r.ok).length;
const submit = async () => {
const ok=checkAns(ans,q.a); setLoading(true);
let t=""; try{t=await callClaude([{role:"user",content:"Q: "+q.q+"\nAnswer: "+ans+"\nCorrect: "+(ok?"Yes":"No, correct: "+q.a[0])}],"Italian teacher. 1-2 sentence feedback. Be encouraging.");}catch{t=ok?"Corretto!":"Correct: "+q.a[0];}
setLoading(false);setResults(p=>[...p,{q:q.q,ans,ok}]);setFb({ok,t});
setTimeout(()=>{setFb(null);setAns("");if(idx+1>=total)setDone(true);else setIdx(i=>i+1);},2800);
};
return (
<div className={cx.modal+" overflow-y-auto py-8"} style={cx.overlay}>
<div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-xl">
{done ? (
<div>
<div className="text-center mb-6"><p className="text-5xl mb-3">{score>=Math.ceil(total*0.7)?"🎉":"📚"}</p><h2 className="text-xl font-bold mb-1">{score>=Math.ceil(total*0.7)?"Livello superato!":"Continua a studiare"}</h2><p className={cx.xs4}>{score}/{total} — {Math.round(score/total*100)}%</p></div>
<div className="space-y-1.5 max-h-48 overflow-y-auto mb-5">{results.map((r,i)=><div key={i} className={"flex items-start space-x-2 px-3 py-2 rounded-lg text-xs "+(r.ok?"bg-green-50":"bg-red-50")}>{r.ok?<CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0"/>:<XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0"/>}<div><p className="text-gray-600 font-medium">{r.q}</p><p className={cx.xs4}>{r.ans}</p></div></div>)}</div>
<div className="flex space-x-3"><button onClick={()=>{if(score<Math.ceil(total*0.7))onFail(level);onClose();}} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200">Close</button>{score>=Math.ceil(total*0.7)&&<button onClick={()=>onPass(level)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:"#22c55e"}}>Advance</button>}</div>
{score<Math.ceil(total*0.7)&&<p className="text-xs text-gray-400 text-center mt-2">Chat 500 more messages to unlock a retake.</p>}
</div>
) : (
<div>
<div className={cx.row+" mb-3"}><p className={cx.xs4}>{test.title}</p><button onClick={onClose}><X className="w-4 h-4 text-gray-300"/></button></div>
<div className="w-full rounded-full h-1 mb-4" style={{background:"#f3f4f6"}}><div className="h-1 rounded-full" style={{width:(idx/total*100)+"%",background:LC(level)}}/></div>
<p className={cx.xs4+" mb-2"}>{idx+1}/{total}</p>
<p className="text-base font-medium text-gray-900 mb-5">{q.q}</p>
{fb?<div className={"p-4 rounded-xl text-sm "+(fb.ok?"bg-green-50 text-green-800":"bg-red-50 text-red-800")}>{fb.ok?"✅ ":"❌ "}{fb.t}</div>:<><input autoFocus type="text" value={ans} onChange={e=>setAns(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ans.trim()&&!loading&&submit()} placeholder="Your answer..." className={cx.input+" mb-3"}/><button onClick={submit} disabled={!ans.trim()||loading} className={cx.btn} style={{background:LC(level)}}>{loading?"Checking...":"Submit"}</button></>}
</div>
)}
</div>
</div>
);
}
function WeeklySummary({students,onSendMsg,reminderSent,setReminderSent}) {
const now=new Date();
const wd=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-6+i);return d.toISOString().slice(0,10);});
const rows=students.map(s=>{const m7=(s.messages||[]).filter(m=>m.sender==="user"&&m.date>=wd[0]);return{...s,msgs7:m7.length,days:new Set(m7.map(m=>m.date)).size,active:wd.map(d=>m7.some(m=>m.date===d))};}).sort((a,b)=>b.msgs7-a.msgs7);
const practiced=rows.filter(r=>r.msgs7>0),silent=rows.filter(r=>r.msgs7===0),total=rows.reduce((a,r)=>a+r.msgs7,0),best=practiced[0];
return(
<div className={cx.card+" space-y-4"}>
<p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Week of {wd[0].slice(5).replace("-","/")} – {wd[6].slice(5).replace("-","/")}</p>
<div className="grid grid-cols-3 gap-2">
{[[practiced.length+"/"+students.length,"Practiced","✅"],[total,"Messages","💬"],[silent.length,"Inactive","😴"]].map(([v,l,ic])=>(
<div key={l} className="rounded-xl p-3 text-center" style={{background:"#f9fafb"}}><p className="text-lg">{ic}</p><p className="text-lg font-bold">{v}</p><p className={cx.xs4}>{l}</p></div>
))}
</div>
{best&&<div className="rounded-xl px-4 py-3 text-sm" style={{background:"#f0fdf4"}}><span className="text-green-600 font-semibold">🏆 </span><span className="text-green-700">{best.name} — {best.msgs7} msgs, {best.days} days</span></div>}
<div className="space-y-2">
{rows.map((r,i)=>(
<div key={i} className={"rounded-xl p-3 border "+(r.msgs7>0?"border-gray-100":"border-red-100 bg-red-50")}>
<div className={cx.row}>
<div className="flex items-center space-x-2.5">
<div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:LC(r.level)}}>{r.name[0].toUpperCase()}</div>
<div><p className="text-sm font-medium">{r.name}</p><p className={cx.xs4}>{r.level} · {r.msgs7} msgs · {r.days}d</p></div>
</div>
<div className="text-right"><p className={cx.xs4}>🔥{r.streak}d</p>{r.msgs7===0&&<p className="text-xs text-red-400 font-medium">No activity</p>}</div>
</div>
<div className="flex gap-1 mt-2">
{r.active.map((a,j)=><div key={j} className="flex-1"><div className="w-full rounded-sm h-1.5 mb-0.5" style={{background:a?LC(r.level):"#f3f4f6"}}/><p className="text-center" style={{fontSize:"8px",color:"#d1d5db"}}>{"MTWTFSS"[j]}</p></div>)}
</div>
</div>
))}
</div>
{silent.length>0&&(
<div className="rounded-xl px-4 py-3 space-y-2" style={{background:"#fff7ed"}}>
<p className="text-xs font-semibold text-orange-600">⚠️ {silent.map(s=>s.name).join(", ")} — no practice this week</p>
<button onClick={async()=>{await Promise.all(silent.map(s=>onSendMsg(s.email,"🔔 Ciao "+s.name.split(" ")[0]+"! Non ti vedo da un po' — anche solo 5 minuti oggi fanno la differenza! Forza! 💪")));setReminderSent(true);setTimeout(()=>setReminderSent(false),3000);}} className="w-full py-2 rounded-xl text-xs font-semibold transition-all" style={{background:reminderSent?"#dcfce7":"#f97316",color:reminderSent?"#16a34a":"white"}}>{reminderSent?"✓ Reminders sent!":"🔔 Send reminder to all inactive"}</button>
</div>
)}
</div>
);
}
function TeacherDash({students,onLogout,onRemove,onResetPw,onSaveNote,onSaveVocab,onSendMsg}) {
const [sel,setSel]=useState(null);const [report,setReport]=useState("");const [loadingReport,setLoadingReport]=useState(false);
const [confirmRm,setConfirmRm]=useState(null);const [resetModal,setResetModal]=useState(null);const [resetDone,setResetDone]=useState(false);
const [noteText,setNoteText]=useState("");const [noteSaved,setNoteSaved]=useState(false);const [showHistory,setShowHistory]=useState(false);
const [vocabText,setVocabText]=useState("");const [vocabSaved,setVocabSaved]=useState(false);const [showVocabHistory,setShowVocabHistory]=useState(false);
const [showWeekly,setShowWeekly]=useState(false);
const [msgText,setMsgText]=useState("");const [msgSent,setMsgSent]=useState(false);
const [reminderSent,setReminderSent]=useState(false);
const genReport = async () => {
setLoadingReport(true);setReport("");
try{const r=await callClaude([{role:"user",content:"Student name: "+sel.name+", Level: "+sel.level+", Messages sent: "+sel.messageCount+", Streak: "+sel.streak+" days, Vocab words: "+sel.vocabCount+(sel.lessonNote?", Last lesson topic: "+sel.lessonNote:"")+(sel.lessonVocab?", Lesson vocabulary: "+sel.lessonVocab:"")}],"You are an Italian teacher writing a short personal message directly to your student. Use their first name. Speak directly to them in second person (you/your). Be warm, specific and encouraging. Mention their actual stats naturally. 3-4 sentences. Write it as if you are about to send it to them as a WhatsApp message.");setReport(r);}
catch{setReport("Unable to generate.");}
setLoadingReport(false);
};
return (
<div className="min-h-screen flex flex-col" style={{background:"#f9fafb"}}>
{confirmRm&&<div className={cx.modal} style={{background:"rgba(0,0,0,0.35)"}}><div className="bg-white rounded-2xl p-7 shadow-xl max-w-xs w-full mx-4 text-center"><p className="text-3xl mb-3">🗑️</p><p className="font-semibold mb-1">Remove {confirmRm.name}?</p><div className="flex space-x-2 mt-4"><button onClick={()=>setConfirmRm(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200">No</button><button onClick={()=>{onRemove(confirmRm.email);if(sel?.email===confirmRm.email)setSel(null);setConfirmRm(null);}} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:"#ef4444"}}>Remove</button></div></div></div>}
{resetModal&&<div className={cx.modal} style={{background:"rgba(0,0,0,0.35)"}}><div className="bg-white rounded-2xl p-7 shadow-xl max-w-xs w-full mx-4 text-center">{resetDone?<><p className="text-3xl mb-3">✅</p><p className="font-semibold mb-2">Password reset</p><p className="text-lg font-bold tracking-widest bg-gray-50 rounded-xl py-2 px-4 mb-4">parlami2026</p><button onClick={()=>{setResetModal(null);setResetDone(false);}} className={cx.btn} style={{background:"#1a1a2e"}}>Done</button></>:<><p className="text-3xl mb-3">🔑</p><p className="font-semibold mb-4">Reset password for {resetModal.name}?</p><div className="flex space-x-2"><button onClick={()=>setResetModal(null)} className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200">Cancel</button><button onClick={async()=>{await onResetPw(resetModal.email);setResetDone(true);}} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:"#f97316"}}>Reset</button></div></>}</div></div>}
<div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
<div className="flex items-center space-x-3"><Logo size={34}/><div><p className="text-sm font-semibold">Parlami</p><p className={cx.xs4}>Teacher Dashboard</p></div></div>
<button onClick={onLogout} className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gray-700"><LogOut className="w-3.5 h-3.5"/><span>Logout</span></button>
</div>
<div className="flex-1 overflow-y-auto">
<div className="max-w-4xl mx-auto px-5 py-6 space-y-5">
<div className="grid grid-cols-3 gap-3">
{[["Students",students.length,"👤"],["Messages",students.reduce((a,s)=>a+s.messageCount,0),"💬"],["Badges",students.reduce((a,s)=>a+s.badgeCount,0),"🏅"]].map(([label,val,icon])=>(
<div key={label} className={cx.card+" text-center"}><p className="text-lg mb-0.5">{icon}</p><p className="text-xl font-bold">{val}</p><p className={cx.xs4}>{label}</p></div>
))}
</div>
<button onClick={()=>setShowWeekly(v=>!v)} className="w-full py-3 rounded-2xl text-sm font-semibold border-2 transition-all" style={{borderColor:showWeekly?"#1a1a2e":"#e5e7eb",background:showWeekly?"#1a1a2e":"white",color:showWeekly?"white":"#374151"}}>
{showWeekly?"✕ Close Weekly Summary":"📊 Weekly Summary"}
</button>
{showWeekly&&<WeeklySummary students={students} onSendMsg={onSendMsg} reminderSent={reminderSent} setReminderSent={setReminderSent}/>}
{students.length===0?<div className={cx.card+" p-16 text-center"}><Users className="w-8 h-8 text-gray-200 mx-auto mb-3"/><p className="text-sm text-gray-400">No students yet.</p></div>:(
<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
<div className="lg:col-span-2 space-y-2">
{students.map((s,i)=>(
<div key={i} className={"bg-white rounded-2xl border p-4 cursor-pointer transition-all "+(sel?.email===s.email?"border-gray-900 shadow-sm":"border-gray-100 hover:border-gray-200")} onClick={()=>{setSel(s);setReport("");setNoteText(s.lessonNote||"");setNoteSaved(false);setShowHistory(false);setMsgText("");setMsgSent(false);setVocabText(s.lessonVocab||"");setVocabSaved(false);setShowVocabHistory(false);}}>
<div className="flex items-center justify-between">
<div className="flex items-center space-x-3">
<div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{background:LC(s.level)}}>{s.name[0].toUpperCase()}</div>
<div><p className="text-sm font-medium">{s.name}</p><p className={cx.xs4}>{s.level} · {s.messageCount} msgs · 🔥{s.streak}</p></div>
</div>
<div className="flex items-center space-x-1">
<button onClick={e=>{e.stopPropagation();setConfirmRm(s);}} className="p-1.5 rounded-lg text-gray-200 hover:text-red-400"><X className="w-3.5 h-3.5"/></button>
<ChevronRight className={"w-4 h-4 "+(sel?.email===s.email?"text-gray-600":"text-gray-200")}/>
</div>
</div>
<div className="mt-3 w-full rounded-full h-0.5" style={{background:"#f3f4f6"}}><div className="h-0.5 rounded-full" style={{width:s.progress+"%",background:LC(s.level)}}/></div>
</div>
))}
</div>
<div className="lg:col-span-3">
{sel?(
<div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
<div className="flex items-center space-x-3">
<div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white" style={{background:LC(sel.level)}}>{sel.name[0].toUpperCase()}</div>
<div><p className="font-semibold">{sel.name}</p><p className={cx.xs4}>{sel.email}</p></div>
</div>
<div className="grid grid-cols-3 gap-2">
{[["Level",sel.level],["Messages",sel.messageCount],["Streak",sel.streak+"d"],["Vocab",sel.vocabCount],["Badges",sel.badgeCount+"/"+BADGES.length],["Tests",sel.testsPassed?.join(", ")||"—"]].map(([l,v])=>(
<div key={l} className="rounded-xl p-3" style={{background:"#f9fafb"}}><p className="text-sm font-semibold">{v}</p><p className={cx.xs4+" mt-0.5"}>{l}</p></div>
))}
</div>
<div>
<div className={cx.row+" text-xs text-gray-400 mb-2"}><span>Level progress</span><span>{sel.progress}%</span></div>
<div className="w-full rounded-full h-1.5" style={{background:"#f3f4f6"}}><div className="h-1.5 rounded-full" style={{width:sel.progress+"%",background:LC(sel.level)}}/></div>
</div>
<div className="rounded-xl border border-gray-100 p-3 space-y-2" style={{background:"#fafafa"}}>
<div className={cx.row}>
<p className="text-xs font-semibold text-gray-500">📝 Lesson Notes</p>
{sel.noteHistory?.length>0&&<button onClick={()=>setShowHistory(h=>!h)} className="text-xs text-gray-400 underline">{showHistory?"Hide":"History ("+sel.noteHistory.length+")"}</button>}
</div>
{showHistory&&sel.noteHistory?.length>0&&(
<div className="space-y-1.5 max-h-40 overflow-y-auto">
{[...sel.noteHistory].reverse().map((e,i)=><div key={i} className="bg-white rounded-lg px-3 py-2 border border-gray-100"><p className="text-xs text-gray-300 mb-0.5">{e.date}</p><p className="text-xs text-gray-600 italic">"{e.note}"</p></div>)}
</div>
)}
<textarea value={noteText} onChange={e=>{setNoteText(e.target.value);setNoteSaved(false);}} rows={3} placeholder="e.g. passato prossimo, travelling to Sicilia..." className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
<button onClick={async()=>{const u=await onSaveNote(sel.email,noteText.trim());if(u)setSel(p=>({...p,...u}));setNoteSaved(true);setShowHistory(false);setTimeout(()=>setNoteSaved(false),2500);}} className="w-full py-2 rounded-xl text-xs font-semibold transition-all" style={{background:noteSaved?"#dcfce7":LC(sel.level),color:noteSaved?"#16a34a":"white"}}>{noteSaved?"✓ Saved!":"Save Note → Andrei will use this"}</button>
</div>
<div className="rounded-xl border border-gray-100 p-3 space-y-2" style={{background:"#fafafa"}}>
<div className={cx.row}>
<p className="text-xs font-semibold text-gray-500">📚 Lesson Vocabulary</p>
{sel.vocabHistory?.length>0&&<button onClick={()=>setShowVocabHistory(h=>!h)} className="text-xs text-gray-400 underline">{showVocabHistory?"Hide":"History ("+sel.vocabHistory.length+")"}</button>}
</div>
{showVocabHistory&&sel.vocabHistory?.length>0&&(
<div className="space-y-1.5 max-h-40 overflow-y-auto">
{[...sel.vocabHistory].reverse().map((e,i)=><div key={i} className="bg-white rounded-lg px-3 py-2 border border-gray-100"><p className="text-xs text-gray-300 mb-0.5">{e.date}</p><p className="text-xs text-gray-600 italic">"{e.vocab}"</p></div>)}
</div>
)}
<textarea value={vocabText} onChange={e=>{setVocabText(e.target.value);setVocabSaved(false);}} rows={3} placeholder="e.g. andare, venire, la casa, il treno..." className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
<button onClick={async()=>{const u=await onSaveVocab(sel.email,vocabText.trim());if(u)setSel(p=>({...p,...u}));setVocabSaved(true);setShowVocabHistory(false);setTimeout(()=>setVocabSaved(false),2500);}} className="w-full py-2 rounded-xl text-xs font-semibold transition-all" style={{background:vocabSaved?"#dcfce7":LC(sel.level),color:vocabSaved?"#16a34a":"white"}}>{vocabSaved?"✓ Saved!":"Save Vocab → Andrei will use this"}</button>
</div>
<div>
<button onClick={genReport} disabled={loadingReport} className={cx.btn} style={{background:"#1a1a2e"}}>{loadingReport?"Generating...":"✨ Generate AI Progress Report"}</button>
{report&&<div className="mt-3 rounded-xl p-4 text-sm text-gray-600 leading-relaxed" style={{background:"#fafafa"}}><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">AI Report</p>{report}</div>}
</div>
<div className="rounded-xl border border-gray-100 p-3 space-y-2" style={{background:"#fafafa"}}>
<p className="text-xs font-semibold text-gray-500">✉️ Message to {sel.name}</p>
<p className={cx.xs4}>Appears in their chat next time they log in.</p>
<textarea value={msgText} onChange={e=>{setMsgText(e.target.value);setMsgSent(false);}} rows={2} placeholder={'e.g. "Bravissima questa settimana! 🎉"'} className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-gray-400 placeholder-gray-300"/>
<button onClick={async()=>{if(!msgText.trim())return;await onSendMsg(sel.email,msgText.trim());setMsgSent(true);setMsgText("");setTimeout(()=>setMsgSent(false),2500);}} disabled={!msgText.trim()} className="w-full py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40" style={{background:msgSent?"#dcfce7":"#1a1a2e",color:msgSent?"#16a34a":"white"}}>
{msgSent?"✓ Message queued!":"Send Message → Appears at login"}
</button>
</div>
<button onClick={()=>{setResetModal(sel);setResetDone(false);}} className="w-full py-2.5 rounded-xl text-sm font-medium border border-orange-200 text-orange-500">🔑 Reset Student Password</button>
</div>
):<div className="bg-white rounded-2xl border border-gray-100 h-full min-h-48 flex items-center justify-center"><p className="text-sm text-gray-300">Select a student</p></div>}
</div>
</div>
)}
</div>
</div>
</div>
);
}
function ProgressTab({messages,studentLevel,practiceStreak,vocabularyCount,testsPassed,unlockedBadges,chartFilter,setChartFilter,activityLog,onShowTest,recurringMistakes,tipLog,testFailedAt,totalMsgCount}) {
const umc=messages.filter(m=>m.sender==="user").length,color=LC(studentLevel);
const today=new Date(),todayStr=today.toISOString().slice(0,10);
const lp=Math.min(Math.floor(umc/LEVEL_REQ[studentLevel]*100),100);
const getData=()=>{const days=chartFilter==="week"?7:chartFilter==="month"?30:null;if(days)return Array.from({length:days},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(days-1-i));const k=d.toISOString().slice(0,10);return{date:k,count:activityLog.find(x=>x.date===k)?.count||0,label:i===days-1?"Today":days===7?d.toLocaleDateString([],{weekday:"short"}):d.getDate()===1||i===0?d.toLocaleDateString([],{day:"numeric",month:"short"}):""};});if(!activityLog.length)return[];const wm={};activityLog.forEach(({date,count})=>{const d=new Date(date),ws=new Date(d);ws.setDate(d.getDate()-d.getDay());const k=ws.toISOString().slice(0,10);wm[k]=(wm[k]||0)+count;});return Object.entries(wm).sort(([a],[b])=>a.localeCompare(b)).map(([date,count])=>({date,count,label:new Date(date).toLocaleDateString([],{day:"numeric",month:"short"})}));};
const data=getData(),mx=Math.max(...data.map(d=>d.count),1);
const tot=data.reduce((s,d)=>s+d.count,0),ad=data.filter(d=>d.count>0).length,bd=data.reduce((b,d)=>d.count>b.count?d:b,{count:0});
const hm=Array.from({length:28},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(27-i));const k=d.toISOString().slice(0,10);return{k,count:activityLog.find(x=>x.date===k)?.count||0};});
return(<div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
<div className="rounded-2xl p-5 text-white" style={{background:"#1a1a2e"}}><div className="flex justify-between items-start mb-4"><div><p className="text-xs opacity-50 mb-1">Current level</p><p className="text-4xl font-bold">{studentLevel}</p><p className="text-xs opacity-50 mt-1">{LN(studentLevel)}</p></div><div className="text-right"><p className="text-xs opacity-50 mb-1">Progress</p><p className="text-2xl font-bold">{lp}%</p><p className="text-xs opacity-50 mt-1">{Math.max(0,LEVEL_REQ[studentLevel]-umc)} msgs left</p></div></div><div className="w-full rounded-full h-1" style={{background:"rgba(255,255,255,0.15)"}}><div className="h-1 rounded-full" style={{width:lp+"%",background:color}}/></div></div>
<div className={cx.card+" space-y-4"}><div className={cx.row}><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">📊 Activity</p><div className="flex rounded-xl overflow-hidden border border-gray-100">{[["week","Week"],["month","Month"],["all","All"]].map(([v,l])=>(<button key={v} onClick={()=>setChartFilter(v)} className="px-3 py-1.5 text-xs font-medium" style={{background:chartFilter===v?color:"transparent",color:chartFilter===v?"white":"#9ca3af"}}>{l}</button>))}</div></div>
<div className="grid grid-cols-3 gap-2">{[[tot,chartFilter==="week"?"This week":chartFilter==="month"?"This month":"All time","💬"],[ad,"Active days","📅"],[bd.count,"Best day","🏆"]].map(([val,label,icon])=>(<div key={label} className="rounded-xl p-2.5 text-center" style={{background:"#f9fafb"}}><p>{icon}</p><p className="text-lg font-bold">{val}</p><p className={cx.xs4}>{label}</p></div>))}</div>
{tot===0?<p className="text-sm text-gray-400 text-center py-4">No messages in this period yet</p>:<><div className="flex items-end gap-px" style={{height:"64px"}}>{data.map((d,i)=><div key={i} className="flex-1 flex flex-col items-center"><div className="w-full rounded-t" style={{height:d.count>0?Math.max(d.count/mx*100,6)+"%":"2px",background:d.count===0?"#f3f4f6":d.date===todayStr?color:color+"99"}}/></div>)}</div><div className="flex gap-px">{data.map((d,i)=><div key={i} className="flex-1 text-center">{d.label&&<p style={{fontSize:"9px",color:"#d1d5db"}}>{d.label}</p>}</div>)}</div></>}
<div className="grid gap-1" style={{gridTemplateColumns:"repeat(28,1fr)"}}>{hm.map((d,i)=><div key={i} className="rounded-sm aspect-square" style={{background:d.count===0?"#f3f4f6":color,opacity:d.count===0?1:Math.min(0.2+d.count*0.15,1),outline:d.k===todayStr?"2px solid "+color:"none",outlineOffset:"1px"}}/>)}</div>
{ad>0&&<div className="rounded-xl px-3 py-2.5 text-xs font-medium text-center" style={{background:color+"15",color}}>{ad>=7?"🔥 You're on a roll!":ad>=4?"⭐ Great consistency!":ad>=2?"👍 Good start — practice every day!":"💡 Even 5 minutes a day makes a difference!"}</div>}</div>
<div className="grid grid-cols-3 gap-3">{[["💬",umc,"Messages"],["🔥",practiceStreak,"Streak"],["📖",vocabularyCount,"Words"]].map(([icon,val,label])=>(<div key={label} className={cx.card+" text-center"}><p className="text-xl mb-1">{icon}</p><p className="text-lg font-bold">{val}</p><p className={cx.xs4}>{label}</p></div>))}</div>
<div className="space-y-2">{(()=>{const failed=testFailedAt?.[studentLevel];const locked=failed!==undefined&&(totalMsgCount-failed)<500;const remaining=locked?500-(totalMsgCount-failed):0;return locked?<div className="w-full py-3 rounded-2xl text-sm font-semibold text-center border border-gray-200 text-gray-400">🔒 Test locked — chat {remaining} more messages to retake</div>:<button onClick={onShowTest} className={cx.btn+" flex items-center justify-center space-x-2"} style={{background:"#1a1a2e"}}><BookOpen className="w-4 h-4"/><span>Take {studentLevel} Level Test</span></button>;})()}<a href="https://preply.com/en/tutor/4536645" target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-2xl text-sm font-semibold text-white text-center" style={{background:"#f97316"}}>📅 Prenota una lezione con Andrei</a></div>
{testsPassed.length>0&&<div className={cx.card}><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tests Passed</p><div className="flex flex-wrap gap-2">{testsPassed.map(l=><span key={l} className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{background:LC(l)}}>{l}</span>)}</div></div>}
<div className={cx.card}><div className="flex items-center space-x-2 mb-3"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">💡 Tips from Andrei</p>{tipLog.length>0&&<span className="text-xs bg-indigo-50 text-indigo-400 px-2 py-0.5 rounded-full">{tipLog.length}</span>}</div>{tipLog.length===0?<p className="text-xs text-gray-300 text-center py-3">Tips will appear here every 5 messages.</p>:<div className="space-y-2">{tipLog.map((t,i)=><div key={i} className="flex items-start space-x-2.5 px-3 py-2.5 rounded-xl" style={{background:"#f5f3ff"}}><Star className="w-3 h-3 mt-0.5 flex-shrink-0" style={{color:"#6366f1"}}/><div><p className="text-xs text-indigo-700 leading-relaxed">{t.text}</p><p className="text-xs text-indigo-300 mt-0.5">{t.date}</p></div></div>)}</div>}</div>
<div className={cx.card}><div className="flex items-center space-x-2 mb-3"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🔁 Andrei is watching</p>{recurringMistakes.length>0&&<span className="text-xs bg-orange-50 text-orange-400 px-2 py-0.5 rounded-full">{recurringMistakes.length}</span>}</div>{recurringMistakes.length===0?<p className="text-xs text-gray-300 text-center py-3">Andrei will track recurring mistakes after a few sessions.</p>:<div className="space-y-2">{recurringMistakes.map((m,i)=><div key={i} className="flex items-start space-x-2.5 px-3 py-2.5 rounded-xl" style={{background:"#fff7ed"}}><span className="text-orange-300 mt-0.5">⚠️</span><p className="text-xs text-orange-700 leading-relaxed">{m}</p></div>)}<p className="text-xs text-gray-300 pt-1">Andrei will gently correct these when they come up.</p></div>}</div>
<div className={cx.card}><div className={cx.row+" mb-3"}><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Badges</p><p className="text-xs text-gray-300">{unlockedBadges.length}/{BADGES.length}</p></div><div className="grid grid-cols-2 gap-2">{BADGES.map(b=>{const u=unlockedBadges.includes(b.id);const raw=b.type==="messages"?umc:b.type==="streak"?practiceStreak:b.type==="tests"?testsPassed.length:vocabularyCount;const p=Math.min(raw/b.req*100,100);return(<div key={b.id} className={"rounded-xl p-3 border "+(u?"border-yellow-200 bg-yellow-50":"border-gray-100 bg-gray-50")}><div className="flex items-center space-x-2 mb-1.5"><span className={"text-xl "+(u?"":"grayscale opacity-40")}>{b.icon}</span><p className={"text-xs font-semibold truncate "+(u?"text-gray-800":"text-gray-500")}>{b.name}</p>{u&&<span className="ml-auto text-green-500 text-xs">✓</span>}</div><p className="text-xs text-gray-400 mb-1.5 leading-tight">{b.desc}</p>{!u&&<><div className="w-full rounded-full h-1" style={{background:"#e5e7eb"}}><div className="h-1 rounded-full" style={{width:p+"%",background:color}}/></div><p className="text-xs text-gray-300 mt-1">{raw.toLocaleString()} / {b.req.toLocaleString()}</p></>}</div>);})}</div></div>
</div>);}
function VocabTab({vocabWords,studentLevel,savedWords,setSavedWords}) {
const color=LC(studentLevel);
const [newWord,setNewWord]=useState("");
const [filter,setFilter]=useState("all");
const starred=savedWords.filter(w=>w.starred&&!w.mastered);
const mastered=savedWords.filter(w=>w.mastered);
const allWords=[...new Map([...vocabWords.map(w=>({word:w.word,count:w.count,fromChat:true})),...savedWords.map(w=>({word:w.word,count:0,fromChat:false}))].map(w=>[w.word,w])).values()];
const toggle=(word,key)=>setSavedWords(p=>{const ex=p.find(w=>w.word===word);if(ex)return p.map(w=>w.word===word?{...w,[key]:!w[key],starred:key==="mastered"&&!w.mastered?false:key==="starred"?!w.starred:w.starred}:w);return[...p,{word,starred:key==="starred",mastered:key==="mastered"}];});
const addWord=()=>{const w=newWord.trim().toLowerCase();if(!w)return;if(!savedWords.find(x=>x.word===w))setSavedWords(p=>[...p,{word:w,starred:false,mastered:false,manual:true}]);setNewWord("");};
const display=filter==="starred"?starred:filter==="mastered"?mastered:allWords.filter(w=>filter!=="active"||!savedWords.find(s=>s.word===w.word&&s.mastered));
return(<div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
<div className={cx.row}><p className="text-sm font-semibold">🗂️ Vocabulary</p><span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{allWords.length} words</span></div>
<div className="flex gap-1.5 flex-wrap">{[["all","All"],["active","Active"],["starred","⭐ Starred"],["mastered","✅ Mastered"]].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} className="px-3 py-1 rounded-full text-xs font-medium" style={{background:filter===v?color:"#f3f4f6",color:filter===v?"white":"#6b7280"}}>{l}</button>)}</div>
<div className="flex gap-2"><input value={newWord} onChange={e=>setNewWord(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addWord()} placeholder="Add a word to learn..." className={cx.input+" flex-1 text-sm"}/><button onClick={addWord} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:color}}>+</button></div>
{display.length===0?<div className={cx.card+" p-8 text-center"}><p className="text-2xl mb-2">📖</p><p className="text-sm text-gray-400">{filter==="starred"?"No starred words yet.":filter==="mastered"?"No mastered words yet.":"Chat in Italian to build your vocabulary!"}</p></div>:
<div className={cx.card}><div className="space-y-1">{display.map((w,i)=>{const sw=savedWords.find(s=>s.word===w.word)||{};return(<div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"><span className={"flex-1 text-sm font-medium "+(sw.mastered?"line-through text-gray-300":"")}>{w.word}</span>{w.count>0&&<span className="text-xs text-gray-300">{w.count}×</span>}<button onClick={()=>toggle(w.word,"starred")} className="text-base" title="Star">{sw.starred?"⭐":"☆"}</button><button onClick={()=>toggle(w.word,"mastered")} className="text-base" title="Mastered">{sw.mastered?"✅":"○"}</button></div>);})}</div></div>}
{mastered.length>0&&filter!=="mastered"&&<p className="text-xs text-gray-300 text-center">{mastered.length} word{mastered.length!==1?"s":""} mastered ✅</p>}
</div>);}

const DEFAULT_EX = [
  {type:"fill",s:"Io ___ uno studente.",a:"sono",h:"essere"},
  {type:"fill",s:"Lei ___ il caffe.",a:"beve",h:"bere"},
  {type:"fill",s:"Noi ___ a Milano.",a:"abitiamo",h:"abitare"},
  {type:"mc",q:"What does buongiorno mean?",o:["Good morning","Good night","Good evening","Goodbye"],a:"Good morning"},
  {type:"mc",q:"I am hungry in Italian:",o:["Ho fame","Sono fame","Ha fame","Hai fame"],a:"Ho fame"},
  {type:"mc",q:"How are you in Italian:",o:["Come stai?","Dove sei?","Chi sei?","Cosa fai?"],a:"Come stai?"}
];

function ExercisesTab({studentLevel,vocabWords,lessonNote,lessonVocab}) {
  const color = LC(studentLevel);
  const [list,setList] = useState(DEFAULT_EX);
  const [busy,setBusy] = useState(false);
  const [inp,setInp] = useState({});
  const [checked,setChecked] = useState({});

  const total = Object.keys(checked).length;
  const correct = Object.values(checked).filter(Boolean).length;

  const checkIt = (i,val) => setChecked(p => ({...p,[i]: norm(val)===norm(list[i].a)}));

  const generate = async () => {
    setBusy(true);
    setInp({});
    setChecked({});
    try {
      const chatVocab = (vocabWords||[]).slice(0,10).map(w=>w.word).join(", ") || "";
      const hasTeacherContent = lessonVocab || lessonNote;
      const teacherBlock = hasTeacherContent
        ? "TEACHER INPUT (base ALL exercises on this):" +
          (lessonVocab ? " New vocabulary words: " + lessonVocab + "." : "") +
          (lessonNote ? " Lesson topic: " + lessonNote + "." : "")
        : "";
      const chatBlock = chatVocab ? "Additional student vocab from chat: " + chatVocab + "." : "";
      const instruction = hasTeacherContent
        ? "You MUST use the teacher's vocabulary words and lesson topic in every exercise. Each exercise must test or practice those specific words."
        : "Create exercises appropriate for the student level.";
      const r = await callClaude(
        [{role:"user",content:"Student level: "+studentLevel+". "+teacherBlock+" "+chatBlock+" "+instruction}],
        "Italian teacher. Return a JSON array of exactly 6 exercises, no other text. 3 fill-in-blank: {\"type\":\"fill\",\"s\":\"sentence with ___\",\"a\":\"answer\",\"h\":\"hint\"}. 3 multiple choice: {\"type\":\"mc\",\"q\":\"question\",\"o\":[\"opt1\",\"opt2\",\"opt3\",\"opt4\"],\"a\":\"correct option\"}."
      );
      const start = r.indexOf("[");
      const end = r.lastIndexOf("]");
      if (start === -1 || end === -1) throw new Error("no array");
      const arr = JSON.parse(r.slice(start, end+1));
      const valid = arr.filter(e => {
        if (!e || !e.type || !e.a) return false;
        if (e.type === "fill") return typeof e.s === "string" && e.s.includes("___");
        if (e.type === "mc") return typeof e.q === "string" && Array.isArray(e.o) && e.o.length >= 2;
        return false;
      });
      if (valid.length >= 4) setList(valid);
    } catch(err) {}
    setBusy(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
      <div className={cx.row}>
        <p className="text-sm font-semibold">Quick Exercises</p>
        <div className="flex items-center gap-3">
          <span className={cx.xs4}>{total}/{list.length} done</span>
          <button onClick={generate} disabled={busy} className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white disabled:opacity-50" style={{background:"#1a1a2e"}}>{busy ? "..." : "Generate"}</button>
        </div>
      </div>
      {(lessonVocab||lessonNote)&&<div className="rounded-xl px-3 py-2.5 text-xs space-y-0.5" style={{background:"#f0fdf4",border:"1px solid #bbf7d0"}}>
        <p className="font-semibold text-green-700">📌 Exercises based on your lesson</p>
        {lessonVocab&&<p className="text-green-600">Vocab: {lessonVocab}</p>}
        {lessonNote&&<p className="text-green-600">Topic: {lessonNote}</p>}
      </div>}

      {busy && (
        <div className={cx.card + " p-8 text-center"}>
          <p className="text-sm text-gray-400">Creating exercises...</p>
        </div>
      )}

      {!busy && list.map((ex,i) => {
        const isDone = checked[i] !== undefined;
        const isOk = checked[i] === true;
        return (
          <div key={i} className={"bg-white rounded-2xl border p-4 " + (isDone ? (isOk ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50") : "border-gray-100")}>
            <div className={cx.row + " mb-3"}>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background: isDone ? (isOk ? "#dcfce7" : "#fee2e2") : color+"22", color: isDone ? (isOk ? "#16a34a" : "#dc2626") : color}}>
                {ex.type === "fill" ? "Fill in the blank" : "Multiple choice"}
              </span>
              {isDone && <span className="text-lg">{isOk ? "✅" : "❌"}</span>}
            </div>

            {ex.type === "fill" && (
              <div>
                <p className="text-sm font-medium mb-1">{isDone ? ex.s.replace("___","["+ex.a+"]") : ex.s}</p>
                {ex.h && !isDone && <p className={cx.xs4 + " mb-2"}>Hint: {ex.h}</p>}
                {!isDone ? (
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={inp[i]||""} onChange={e => setInp(p=>({...p,[i]:e.target.value}))} onKeyDown={e => e.key==="Enter" && (inp[i]||"").trim() && checkIt(i,inp[i])} placeholder="Your answer" className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"/>
                    <button onClick={() => (inp[i]||"").trim() && checkIt(i,inp[i])} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:"#1a1a2e"}}>Check</button>
                  </div>
                ) : (
                  <p className="text-xs mt-1 font-medium" style={{color: isOk ? "#16a34a" : "#dc2626"}}>{isOk ? "Perfetto!" : "Correct: " + ex.a}</p>
                )}
              </div>
            )}

            {ex.type === "mc" && (
              <div>
                <p className="text-sm font-medium mb-3">{ex.q}</p>
                <div className="grid grid-cols-2 gap-2">
                  {ex.o.map((opt,j) => {
                    const isC = opt === ex.a;
                    const isSel = inp[i] === opt;
                    let bg = "#f9fafb", br = "#e5e7eb", co = "#374151";
                    if (isDone) {
                      if (isC) { bg="#dcfce7"; br="#86efac"; co="#16a34a"; }
                      else if (isSel) { bg="#fee2e2"; br="#fca5a5"; co="#dc2626"; }
                    } else if (isSel) { bg="#f0f0ff"; br=color; co=color; }
                    return (
                      <button key={j} onClick={() => { if (isDone) return; setInp(p=>({...p,[i]:opt})); checkIt(i,opt); }} className="px-3 py-2 rounded-xl text-xs font-medium border text-left" style={{background:bg,borderColor:br,color:co}}>{opt}</button>
                    );
                  })}
                </div>
                {isDone && <p className="text-xs mt-2 font-medium" style={{color: isOk ? "#16a34a" : "#dc2626"}}>{isOk ? "Perfetto!" : "Correct: " + ex.a}</p>}
              </div>
            )}
          </div>
        );
      })}

      {total === list.length && total > 0 && (
        <div className={cx.card + " p-5 text-center"}>
          <p className="text-4xl mb-2">{correct === list.length ? "🏆" : correct >= list.length/2 ? "👍" : "📚"}</p>
          <p className="font-semibold">{correct}/{list.length} correct</p>
          <button onClick={generate} className={cx.btn + " mt-3"} style={{background:"#1a1a2e"}}>New Exercises</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
const [view,setView]=useState("login");const [name,setName]=useState("");const [email,setEmail]=useState("");
const [pw,setPw]=useState("");const [pw2,setPw2]=useState("");const [step,setStep]=useState("identify");
const [tPw,setTPw]=useState("");const [loginErr,setLoginErr]=useState("");
const [msgs,setMsgs]=useState([]);const [curMsg,setCurMsg]=useState("");const [typing,setTyping]=useState(false);
const [level,setLevel]=useState("A1");const [badges,setBadges]=useState([]);const [vocabCount,setVocabCount]=useState(0);
const [streak,setStreak]=useState(0);const [lastDate,setLastDate]=useState(null);const [badgeNotif,setBadgeNotif]=useState(null);
const [showTest,setShowTest]=useState(false);const [testsPassed,setTestsPassed]=useState([]);const [testFailedAt,setTestFailedAt]=useState({});const [students,setStudents]=useState([]);
const [tab,setTab]=useState("chat");const [file,setFile]=useState(null);const [lessonNote,setLessonNote]=useState("");const [lessonVocab,setLessonVocab]=useState("");
const [activityLog,setActivityLog]=useState([]);const [chartFilter,setChartFilter]=useState("week");const [vocabWords,setVocabWords]=useState([]);
const [totalMsgCount,setTotalMsgCount]=useState(0);const [recurringMistakes,setRecurringMistakes]=useState([]);const [tipLog,setTipLog]=useState([]);const [savedWords,setSavedWords]=useState([]);
const [dailyGoal,setDailyGoal]=useState(10);const [showGoalPicker,setShowGoalPicker]=useState(false);const [customGoal,setCustomGoal]=useState("");
const [showChangePw,setShowChangePw]=useState(false);const [oldPw,setOldPw]=useState("");const [newPw,setNewPw]=useState("");const [newPw2,setNewPw2]=useState("");const [changePwErr,setChangePwErr]=useState("");const [changePwOk,setChangePwOk]=useState(false);
const fileRef=useRef(null),endRef=useRef(null);
const umc=msgs.filter(m=>m.sender==="user").length;
const lp=Math.min(Math.floor(umc/LEVEL_REQ[level]*100),100);
const todayStr0=new Date().toISOString().slice(0,10);
const todayCount=msgs.filter(m=>m.sender==="user"&&m.date===todayStr0).length;
const store=async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v));}catch{}};
const load=async k=>{try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}};
useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
useEffect(()=>{if(view==="student")endRef.current?.scrollIntoView({behavior:"instant"});},[view]);
useEffect(()=>{if(view!=="student"||!email)return;store("student:"+email,{name,email,level,passwordHash:hashPw(pw),messages:msgs,badges,streak,lastDate,testsPassed,testFailedAt,vocabCount,lessonNote,lessonVocab,recurringMistakes,tipLog,dailyGoal,totalMsgCount,savedWords,messageCount:umc,progress:lp,badgeCount:badges.length});},[msgs,level,badges,streak,testsPassed,vocabCount,tipLog,recurringMistakes,dailyGoal,savedWords]);
useEffect(()=>{if(!msgs.length)return;const t=new Date().toDateString();if(lastDate===t)return;setStreak(p=>lastDate===new Date(Date.now()-86400000).toDateString()?p+1:1);setLastDate(t);},[msgs]);
useEffect(()=>{const wm={};msgs.filter(m=>m.sender==="user").forEach((m,i)=>{const k=m.date||(()=>{const d=new Date();d.setDate(d.getDate()-Math.floor((umc-i-1)/4));return d.toISOString().slice(0,10);})();wm[k]=(wm[k]||0)+1;});setActivityLog(Object.entries(wm).sort(([a],[b])=>a.localeCompare(b)).map(([date,count])=>({date,count})));},[msgs]);
useEffect(()=>{
const IT_WORDS=new Set("il la lo i gli le un una dello della degli delle nel nella nei nelle sul sulla sui sulle dal dalla dai dalle col colla coi colle al alla ai alle sia che non sono hai ha abbiamo avete hanno essere fare dire dare stare andare venire sapere vedere sentire parlare capire mangiare bere dormire leggere scrivere studiare lavorare giocare trovare pensare volere potere dovere credere avere questo questa questi queste quello quella quelli quelle mio mia miei mie tuo tua tuoi tue suo sua suoi sue nostro nostra nostri nostre vostro vostra vostri vostre loro lui lei noi voi loro chi cosa come quando dove perché quanto quale bello bella buono buona grande piccolo piccola nuovo nuova vecchio vecchia primo prima secondo seconda molto pochi tanti tutti grazie prego scusi ciao arrivederci buongiorno buonasera buonanotte benvenuto benvenuta subito ancora sempre mai spesso oggi ieri domani adesso ora dopo prima qui lì casa lavoro scuola città paese vita giorno notte settimana mese anno tempo acqua pane vino caffè carne pesce frutta verdura pasta riso nome città strada numero telefono amico amica ragazzo ragazza uomo donna bambino bambina signore signora dottore professore studente studentessa italiano italiana italiano inglese francese spagnolo tedesco chiamo chiami chiama chiamiamo chiamate chiamano parlo parli parla parliamo parlate parlano vado vai va andiamo andate vanno vengo vieni viene veniamo venite vengono faccio fai fatto facciamo fate fanno so sai sa sappiamo sapete sanno voglio vuoi vuole vogliamo volete vogliono posso puoi può possiamo potete possono devo devi deve dobbiamo dovete devono".split(" "));
const wm={};
msgs.filter(m=>m.sender==="user").forEach(m=>{
  (m.text.toLowerCase().match(/[a-zàèéìòùü]{3,}/g)||[]).forEach(w=>{
    const hasAccent=/[àèéìòùü]/.test(w);
    const isKnownIt=IT_WORDS.has(w);
    const looksIt=/[aeiou]{2,}/.test(w)&&!/^(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|own|see|two|way|who|any|did|end|few|got|let|man|men|put|say|she|too|use|why|ago|ago|ask|big|boy|car|did|far|got|job|just|keep|know|last|left|life|like|live|made|make|most|move|much|need|next|over|part|play|said|same|seem|show|some|such|take|tell|that|them|then|they|this|told|turn|very|well|went|were|what|when|will|with|year|your)$/.test(w);
    if(hasAccent||isKnownIt||(looksIt&&w.length>=5)){
      if(!wm[w])wm[w]={word:w,count:0};
      wm[w].count++;
    }
  });
});
const s=Object.values(wm).sort((a,b)=>b.count-a.count);
setVocabWords(s);setVocabCount(s.length);
},[msgs]);
useEffect(()=>{BADGES.forEach(b=>{if(badges.includes(b.id))return;const p=b.type==="messages"?umc:b.type==="streak"?streak:b.type==="tests"?testsPassed.length:vocabCount;if(p>=b.req){setBadges(p=>[...p,b.id]);setBadgeNotif(b);setTimeout(()=>setBadgeNotif(null),3500);}});},[umc,streak,vocabCount,testsPassed]);
const checkEmail=async e=>{const d=await load("student:"+e);return d?{exists:true,hasPassword:!!d.passwordHash,name:d.name||""}:{exists:false};};
const loadData=async(e,hash)=>{const d=await load("student:"+e);if(!d)return"not_found";if(d.passwordHash&&d.passwordHash!==hash)return"wrong_password";
const today=new Date();const isFirstOfMonth=today.getDate()===1;const lastClean=d.lastMonthlyClean||"";const thisMonth=today.toISOString().slice(0,7);if(isFirstOfMonth&&lastClean!==thisMonth){d.messages=[];d.lastMonthlyClean=thisMonth;await store("student:"+e,d);}
setMsgs(d.messages||[]);setLevel(d.level||"A1");setBadges(d.badges||[]);setStreak(d.streak||0);setLastDate(d.lastDate||null);setTestsPassed(d.testsPassed||[]);setTestFailedAt(d.testFailedAt||{});setVocabCount(d.vocabCount||0);setLessonNote(d.lessonNote||"");setRecurringMistakes(d.recurringMistakes||[]);setTipLog(d.tipLog||[]);setDailyGoal(d.dailyGoal||10);setLessonVocab(d.lessonVocab||"");setTotalMsgCount(d.totalMsgCount||0);setSavedWords(d.savedWords||[]);
if(d.pendingMsg){
const tm={id:Date.now(),text:"👨‍🏫 "+d.pendingMsg,sender:"ai",fromTeacher:true,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:new Date().toISOString().slice(0,10)};
setMsgs(prev=>[...(d.messages||[]),tm]);
d.pendingMsg=null; await store("student:"+e,d);
}
return"ok";};
const handleIdentify=async()=>{if(!email.trim()){setLoginErr("Please enter your email.");return;}const i=await checkEmail(email.trim().toLowerCase());if(i.exists&&i.hasPassword){setName(i.name);setStep("returning");}else if(i.exists){setName(i.name);setStep("newuser");}else setStep("newuser");setLoginErr("");};
const handleLogin=async()=>{const r=await loadData(email.trim().toLowerCase(),hashPw(pw));if(r==="wrong_password"){setLoginErr("Incorrect password.");setPw("");}else if(r==="ok"){setLoginErr("");setView("student");}else{setLoginErr("Account not found.");setStep("identify");}};
const handleRegister=async()=>{if(!name.trim()){setLoginErr("Please enter your name.");return;}if(pw.length<4){setLoginErr("Password must be at least 4 characters.");return;}if(pw!==pw2){setLoginErr("Passwords don't match.");return;}await loadData(email.trim().toLowerCase(),null);setLoginErr("");setView("student");};
const logout=()=>{setView("login");setMsgs([]);setTab("chat");setLevel("A1");setBadges([]);setStreak(0);setLastDate(null);setTestsPassed([]);setVocabCount(0);setPw("");setPw2("");setLessonNote("");setStep("identify");setLoginErr("");setRecurringMistakes([]);setTipLog([]);setTotalMsgCount(0);setSavedWords([]);setShowChangePw(false);setOldPw("");setNewPw("");setNewPw2("");setChangePwErr("");};
const handleChangePw=async()=>{const d=await load("student:"+email);if(!d||d.passwordHash!==hashPw(oldPw)){setChangePwErr("Current password is incorrect.");return;}if(newPw.length<4){setChangePwErr("New password must be at least 4 characters.");return;}if(newPw!==newPw2){setChangePwErr("Passwords don't match.");return;}d.passwordHash=hashPw(newPw);await store("student:"+email,d);setPw(newPw);setChangePwOk(true);setTimeout(()=>{setShowChangePw(false);setOldPw("");setNewPw("");setNewPw2("");setChangePwErr("");setChangePwOk(false);},1800);};
useEffect(()=>{
if(view!=="student")return;
const ts=new Date().toISOString().slice(0,10);
if(msgs.some(m=>m.sender==="ai"&&m.date===ts))return;
const hour=new Date().getHours();
const practicedToday=msgs.filter(m=>m.sender==="user"&&m.date===ts).length;
const streakAtRisk=streak>0&&practicedToday===0;
const goalBehind=practicedToday<dailyGoal&&hour>=18;
const open=async()=>{
setTyping(true);
try{
const np=lessonNote?"Teacher's last lesson note: \""+lessonNote+"\". Reference this naturally.":"";
const vp=lessonVocab?"New vocabulary from this lesson: \""+lessonVocab+"\". Try to use or reference these words naturally.":"";
let urgency="";
if(streakAtRisk&&streak>=3) urgency="IMPORTANT: The student has a "+streak+"-day streak at risk today — they haven't practiced yet. Open with urgent but encouraging Italian warning about losing the streak. Reference the number directly.";
else if(goalBehind) urgency="The student hasn't reached their daily goal of "+dailyGoal+" messages yet and it's evening. Open with a gentle motivating nudge in Italian to keep going.";
const r=await callClaude([{role:"user",content:"[Student just logged in]"}],"You are Andrei, Italian tutor. Student is "+LN(level)+" ("+level+"). "+np+" "+vp+" "+(urgency||"Open with a warm greeting. 2-3 sentences.")+" End with a question in Italian.");
setMsgs(p=>[...p,{id:Date.now(),text:r,sender:"ai",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:ts}]);
}catch{}
setTyping(false);
};
open();
},[view]);
const send=async()=>{
if((!curMsg.trim()&&!file)||typing)return;
const txt=curMsg,f=file;setCurMsg("");setFile(null);
const um={id:Date.now(),text:txt||(f?"📎 "+f.name:""),sender:"user",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:new Date().toISOString().slice(0,10)};
setMsgs(p=>[...p,um]);setTyping(true);
try{
const hist=msgs.slice(-12).map(m=>({role:m.sender==="user"?"user":"assistant",content:m.text}));
let uc=[];if(f){if(f.type==="pdf")uc.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:f.data}});else uc.push({type:"image",source:{type:"base64",media_type:f.mediaType,data:f.data}});}
uc.push({type:"text",text:txt||"Please review and help me practice."});hist.push({role:"user",content:uc});
const np=lessonNote?"LAST LESSON NOTES: \""+lessonNote+"\". Reference naturally.":"";
const vp=lessonVocab?"LESSON VOCABULARY: \""+lessonVocab+"\". Encourage use of these words, correct gently if misused.":"";
const mp=recurringMistakes.length>0?"RECURRING MISTAKES: "+recurringMistakes.map((m,i)=>(i+1)+". "+m).join("; ")+". Correct gently once if they appear.":"";
const sys="You are Andrei, Italian tutor. Student is "+LN(level)+" ("+level+"). "+np+" "+vp+" "+mp+" Mostly Italian, English only for grammar notes. 2-4 sentences, end with question. Do NOT correct English loanwords used in Italian (drink, cocktail, computer, smartphone, sport, bar, ok, wifi, stress, etc) — these are normal Italian.";
const reply=await callClaude(hist,sys);
setMsgs(p=>[...p,{id:Date.now()+1,text:reply,sender:"ai",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:new Date().toISOString().slice(0,10)}]);
const newTotal=totalMsgCount+1;setTotalMsgCount(newTotal);
if(newTotal%10===0){const re=msgs.slice(-20).map(m=>(m.sender==="user"?"Student: ":"Andrei: ")+m.text).join("\n");try{const ex=await callClaude([{role:"user",content:"Previous mistakes tracked: "+JSON.stringify(recurringMistakes)+"\n\nRecent conversation:\n"+re}],"Italian teacher. Analyse the recent conversation carefully. Return a JSON object with two keys: {\"add\": [new recurring mistakes you notice, max 2], \"remove\": [mistakes from the previous list that the student is now getting right consistently]}. Return ONLY the JSON object. IMPORTANT: Do NOT flag English loanwords used in Italian (drink, cocktail, computer, smartphone, internet, sport, bar, club, stress, ok, wifi, etc) — these are normal and accepted in Italian. If nothing to add or remove, use empty arrays.");const parsed=JSON.parse(ex.replace(/^[^{]*\{/,"{").replace(/\}[^}]*$/,"}").trim());setRecurringMistakes(p=>{let updated=p.filter(m=>!(parsed.remove||[]).some(r=>r.toLowerCase().includes(m.toLowerCase().slice(0,15))||m.toLowerCase().includes(r.toLowerCase().slice(0,15))));updated=[...new Set([...updated,...(parsed.add||[])])].slice(0,5);return updated;});}catch{}}
if(newTotal%5===0){
  const recentExchange=msgs.slice(-10).map(m=>(m.sender==="user"?"Student: ":"Andrei: ")+m.text).join("\n");
  try{
    const fb=await callClaude(
      [{role:"user",content:"Recent conversation:\n"+recentExchange}],
      "You are Andrei, an Italian teacher. Read the conversation and write ONE specific, short tip (max 2 sentences) about something the student actually did in this conversation — a mistake they made, a word they used incorrectly, or a grammar point they struggled with. Be direct and concrete. Example format: 'You used \"ho andato\" — with movement verbs like andare, use essere: \"sono andato\". Remember: essere for movement, avere for actions.' If the student made no errors, pick one useful grammar point from what they discussed. Never give generic advice. IMPORTANT: Do NOT correct English loanwords used in Italian (drink, cocktail, computer, smartphone, internet, sport, bar, club, stress, ok, wifi, etc) — these are completely normal and accepted in Italian."
    );
    setTipLog(p=>[{text:fb,date:new Date().toLocaleDateString([],{day:"numeric",month:"short"})},...p].slice(0,10));
  }catch{}
}
}catch{setMsgs(p=>[...p,{id:Date.now()+1,text:"Ciao! Continuiamo a praticare! 🇮🇹",sender:"ai",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);}
setTyping(false);
};
const handleRemove=async e=>{try{await window.storage.delete("student:"+e);}catch{}setStudents(p=>p.filter(s=>s.email!==e));};
const handleResetPw=async e=>{const d=await load("student:"+e);if(d){d.passwordHash=hashPw("parlami2026");await store("student:"+e,d);}};
const handleSaveNote=async(e,note)=>{const d=await load("student:"+e);if(d){const date=new Date().toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"});d.lessonNote=note;d.lessonNoteDate=date;d.noteHistory=[...(d.noteHistory||[]),{note,date}];await store("student:"+e,d);setStudents(p=>p.map(s=>s.email===e?{...s,lessonNote:note,lessonNoteDate:date,noteHistory:d.noteHistory}:s));return{lessonNote:note,lessonNoteDate:date,noteHistory:d.noteHistory};}return null;};
const handleSaveVocab=async(e,vocab)=>{const d=await load("student:"+e);if(d){const date=new Date().toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"});d.lessonVocab=vocab;d.vocabHistory=[...(d.vocabHistory||[]),{vocab,date}];await store("student:"+e,d);setStudents(p=>p.map(s=>s.email===e?{...s,lessonVocab:vocab,vocabHistory:d.vocabHistory}:s));return{lessonVocab:vocab,vocabHistory:d.vocabHistory};}return null;};
const handleSendMsg=async(e,msg)=>{const d=await load("student:"+e);if(d){d.pendingMsg=msg;await store("student:"+e,d);}};
const loadAll=async()=>{try{const keys=await window.storage.list("student:");const loaded=await Promise.all((keys.keys||[]).map(async k=>{try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}}));setStudents(loaded.filter(Boolean));}catch{}};
const passTest=l=>{setTestsPassed(p=>[...p,l]);const ni=LEVELS.indexOf(l)+1;if(ni<LEVELS.length)setLevel(LEVELS[ni]);setShowTest(false);};
const failTest=l=>{setTestFailedAt(p=>({...p,[l]:totalMsgCount}));setShowTest(false);};
if(view==="teacher") return <TeacherDash students={students} onLogout={()=>setView("login")} onRemove={handleRemove} onResetPw={handleResetPw} onSaveNote={handleSaveNote} onSaveVocab={handleSaveVocab} onSendMsg={handleSendMsg}/>;
if(view==="login") return (
<div className="min-h-screen flex items-center justify-center p-4" style={{background:"#f9fafb"}}>
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
<div className="flex flex-col items-center mb-8"><Logo size={64}/><h1 className="text-xl font-bold mt-4">Parlami</h1><p className={cx.xs4+" mt-1"}>Practice Italian between lessons</p></div>
{step==="identify"&&<div className="space-y-3 mb-4"><input type="text" value={email} onChange={e=>{setEmail(e.target.value);setLoginErr("");}} onKeyDown={e=>e.key==="Enter"&&email.trim()&&handleIdentify()} placeholder="Email address" className={cx.input}/><button onClick={handleIdentify} disabled={!email.trim()} className={cx.btn} style={{background:"#1a1a2e"}}>Continue →</button></div>}
{step==="returning"&&<div className="space-y-3 mb-4"><div className="flex items-center space-x-2 mb-1"><button onClick={()=>{setStep("identify");setLoginErr("");}} className="text-gray-400 text-lg">←</button><p className="text-sm text-gray-600">Welcome back, <span className="font-semibold">{name}</span></p></div><PwInput value={pw} onChange={e=>{setPw(e.target.value);setLoginErr("");}} onEnter={handleLogin} placeholder="Your password" autoFocus/><button onClick={handleLogin} disabled={!pw} className={cx.btn} style={{background:"#1a1a2e"}}>Log In</button></div>}
{step==="newuser"&&<div className="space-y-3 mb-4"><div className="flex items-center space-x-2 mb-1"><button onClick={()=>{setStep("identify");setLoginErr("");}} className="text-gray-400 text-lg">←</button><p className="text-sm text-gray-500">Create your account</p></div><input type="text" value={name} onChange={e=>{setName(e.target.value);setLoginErr("");}} autoFocus placeholder="Your name" className={cx.input}/><PwInput value={pw} onChange={e=>{setPw(e.target.value);setLoginErr("");}} placeholder="Choose a password"/><PwInput value={pw2} onChange={e=>{setPw2(e.target.value);setLoginErr("");}} onEnter={handleRegister} placeholder="Confirm password"/><button onClick={handleRegister} disabled={!name.trim()||!pw||!pw2} className={cx.btn} style={{background:"#1a1a2e"}}>Create Account</button></div>}
{loginErr&&<p className="text-red-400 text-xs text-center mb-3">{loginErr}</p>}
<div className="border-t border-gray-100 pt-4 flex space-x-2">
<PwInput value={tPw} onChange={e=>setTPw(e.target.value)} onEnter={()=>tPw===TEACHER_PW&&(loadAll(),setView("teacher"))} placeholder="Teacher password"/>
<button onClick={()=>{if(tPw===TEACHER_PW){loadAll();setView("teacher");}else setLoginErr("Wrong password.");}} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200">Enter</button>
</div>
</div>
</div>
);
return (
<div className="flex flex-col h-screen" style={{background:"#f9fafb"}}>
{showTest&&<TestModal level={level} onClose={()=>setShowTest(false)} onPass={passTest} onFail={failTest}/>}
{showChangePw&&(
<div className={cx.modal} style={{background:"rgba(0,0,0,0.35)"}}>
<div className="bg-white rounded-2xl p-7 shadow-xl max-w-xs w-full mx-4">
{changePwOk?<div className="text-center py-4"><p className="text-3xl mb-3">✅</p><p className="font-semibold">Password updated!</p></div>:(
<><div className={cx.row+" mb-5"}><p className="font-semibold">Change Password</p><button onClick={()=>{setShowChangePw(false);setOldPw("");setNewPw("");setNewPw2("");setChangePwErr("");}}><X className="w-4 h-4 text-gray-400"/></button></div>
<div className="space-y-3">
<PwInput value={oldPw} onChange={e=>{setOldPw(e.target.value);setChangePwErr("");}} placeholder="Current password" autoFocus/>
<PwInput value={newPw} onChange={e=>{setNewPw(e.target.value);setChangePwErr("");}} placeholder="New password"/>
<PwInput value={newPw2} onChange={e=>{setNewPw2(e.target.value);setChangePwErr("");}} onEnter={handleChangePw} placeholder="Confirm new password"/>
{changePwErr&&<p className="text-red-400 text-xs">{changePwErr}</p>}
<button onClick={handleChangePw} disabled={!oldPw||!newPw||!newPw2} className={cx.btn} style={{background:"#1a1a2e"}}>Update Password</button>
</div></>
)}
</div>
</div>
)}
{badgeNotif&&<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50"><div className="flex items-center space-x-3 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium" style={{background:"#1a1a2e"}}><span className="text-2xl">{badgeNotif.icon}</span><span>Badge unlocked: {badgeNotif.name}</span></div></div>}
<div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
<div className="flex items-center space-x-2.5"><Logo size={32}/><div><p className="text-sm font-semibold">Parlami</p><p className={cx.xs4}>{name}</p></div></div>
<div className="flex items-center space-x-2"><button onClick={()=>setShowChangePw(true)} className="text-gray-300 hover:text-gray-500" title="Change password"><span className="text-sm">🔑</span></button><button onClick={logout} className="text-gray-300 hover:text-gray-500"><LogOut className="w-4 h-4"/></button></div>
</div>
{showGoalPicker&&(
<div className={cx.modal} style={{background:"rgba(0,0,0,0.35)"}}>
<div className="bg-white rounded-2xl p-7 shadow-xl max-w-xs w-full mx-4">
<div className={cx.row+" mb-5"}><p className="font-semibold">Daily Goal</p><button onClick={()=>{setShowGoalPicker(false);setCustomGoal("");}}><X className="w-4 h-4 text-gray-400"/></button></div>
<p className={cx.xs4+" mb-4"}>How many messages do you want to send each day?</p>
<div className="grid grid-cols-4 gap-2 mb-4">
{[5,10,20,30].map(g=><button key={g} onClick={()=>{setDailyGoal(g);setShowGoalPicker(false);}} className="py-2.5 rounded-xl text-sm font-semibold border transition-all" style={{background:dailyGoal===g?LC(level):"#f9fafb",color:dailyGoal===g?"white":"#374151",borderColor:dailyGoal===g?LC(level):"#e5e7eb"}}>{g}</button>)}
</div>
<div className="flex space-x-2">
<input type="number" min="1" max="100" value={customGoal} onChange={e=>setCustomGoal(e.target.value)} placeholder="Custom…" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"/>
<button onClick={()=>{const v=parseInt(customGoal);if(v>0&&v<=100){setDailyGoal(v);setShowGoalPicker(false);setCustomGoal("");}}} disabled={!customGoal||parseInt(customGoal)<=0} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{background:"#1a1a2e"}}>Set</button>
</div>
</div>
</div>
)}
<div className="bg-white border-b border-gray-100 flex flex-shrink-0">
{[["chat","Chat"],["progress","Progress"],["vocab","Vocab"],["exercises","Exercises"]].map(([t,l])=>{
if(t==="chat"){
const pct=Math.min(todayCount/dailyGoal,1), r=10, circ=2*Math.PI*r, done=todayCount>=dailyGoal;
return(
<button key={t} onClick={()=>setTab(t)} className={"flex-1 py-2.5 text-xs font-medium transition-colors flex flex-col items-center space-y-0.5 "+(tab===t?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600")}>
<div className="relative w-6 h-6 cursor-pointer" onClick={e=>{e.stopPropagation();setShowGoalPicker(true);}}>
<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r={r} fill="none" stroke="#f3f4f6" strokeWidth="2.5"/><circle cx="12" cy="12" r={r} fill="none" stroke={done?"#22c55e":LC(level)} strokeWidth="2.5" strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round" transform="rotate(-90 12 12)"/></svg>
<span className="absolute inset-0 flex items-center justify-center" style={{fontSize:"7px",fontWeight:700,color:done?"#22c55e":LC(level)}}>{todayCount}</span>
</div>
<span>{l}</span>
</button>
);
}
return <button key={t} onClick={()=>setTab(t)} className={"flex-1 py-3 text-xs font-medium transition-colors "+(tab===t?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600")}>{l}</button>;
})}
</div>
{tab==="chat"&&(
<div className="flex flex-col flex-1 min-h-0">
{todayCount>=dailyGoal&&todayCount>0&&(
<div className="mx-4 mt-3 px-4 py-2.5 rounded-xl flex items-center space-x-2 flex-shrink-0" style={{background:"#f0fdf4"}}>
<span>🎯</span>
<p className="text-xs font-semibold text-green-700 flex-1">Daily goal reached! {todayCount}/{dailyGoal} messages today</p>
<button onClick={()=>setShowGoalPicker(true)} className="text-xs text-green-500 underline">change</button>
</div>
)}
{todayCount<dailyGoal&&streak>=3&&(()=>{const h=new Date().getHours();if(h<18)return null;return(
<div className="mx-4 mt-3 px-4 py-2.5 rounded-xl flex items-center space-x-2 flex-shrink-0" style={{background:"#fff7ed"}}>
<span>🔥</span>
<p className="text-xs font-semibold text-orange-700 flex-1">{streak}-day streak at risk! {dailyGoal-todayCount} more message{dailyGoal-todayCount!==1?"s":""} to protect it today</p>
</div>
);})()}
{tipLog.length>0&&(
<div className="mx-4 mt-3 px-4 py-3 rounded-xl flex items-start space-x-2 flex-shrink-0" style={{background:"#f5f3ff"}}>
<Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{color:"#6366f1"}}/>
<div className="flex-1 min-w-0"><p className="text-xs font-semibold mb-0.5" style={{color:"#6366f1"}}>💡 Tip from Andrei</p><p className="text-xs leading-relaxed" style={{color:"#4f46e5"}}>{tipLog[0].text}</p></div>
<button onClick={()=>setTipLog(p=>p.slice(1))}><X className="w-3.5 h-3.5" style={{color:"#a5b4fc"}}/></button>
</div>
)}
<div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
{msgs.length===0&&!typing&&<div className="flex flex-col items-center justify-center h-full text-center py-16"><Logo size={56}/><p className="text-gray-800 font-semibold mt-4 mb-1">Ciao, {name}!</p><p className="text-sm text-gray-400">Andrei is preparing your session…</p></div>}
{msgs.map(m=><div key={m.id} className={"flex "+(m.sender==="user"?"justify-end":"justify-start")}><div className={"max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed "+(m.sender==="user"?"text-white rounded-br-sm":"rounded-bl-sm "+(m.fromTeacher?"text-white":"text-gray-800 border border-gray-100 bg-white"))} style={m.sender==="user"?{background:"#1a1a2e"}:m.fromTeacher?{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}:{}}>{m.fromTeacher&&<p className="text-xs font-semibold mb-1 opacity-75">✉️ Message from your teacher</p>}<p>{m.fromTeacher?m.text.replace("👨‍🏫 ",""):m.text}</p><p className={"text-xs mt-1.5 "+(m.sender==="user"?"text-gray-400":m.fromTeacher?"text-indigo-200":"text-gray-300")}>{m.time}</p></div></div>)}
{typing&&<div className="flex justify-start"><div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3"><div className="flex space-x-1">{[0,0.2,0.4].map((d,i)=><div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{animationDelay:d+"s"}}/>)}</div></div></div>}
<div ref={endRef}/>
</div>
<div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
{file&&<div className="flex items-center space-x-2 mb-2 px-3 py-2 rounded-xl text-xs" style={{background:"#f3f4f6"}}><span>{file.type==="pdf"?"📄":"🖼️"}</span><span className="text-gray-600 truncate flex-1">{file.name}</span><button onClick={()=>setFile(null)}><X className="w-3.5 h-3.5 text-gray-400"/></button></div>}
<div className="flex items-center space-x-2">
<input ref={fileRef} type="file" accept="image/*,.pdf" onChange={e=>{const f=e.target.files[0];if(!f)return;const isPdf=f.type==="application/pdf";if(!isPdf&&!f.type.startsWith("image/"))return;const r=new FileReader();r.onload=()=>setFile({type:isPdf?"pdf":"image",mediaType:f.type,data:r.result.split(",")[1],name:f.name});r.readAsDataURL(f);}} className="hidden"/>
<button onClick={()=>fileRef.current?.click()} disabled={typing} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 border border-gray-200 disabled:opacity-40"><span>📎</span></button>
<input type="text" value={curMsg} onChange={e=>setCurMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={file?"Add a message or just send…":"Scrivi un messaggio…"} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white" disabled={typing}/>
<button onClick={send} disabled={typing||(!curMsg.trim()&&!file)} className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40" style={{background:"#1a1a2e"}}><Send className="w-4 h-4"/></button>
</div>
</div>
</div>
)}
{tab==="progress"&&<ProgressTab messages={msgs} studentLevel={level} practiceStreak={streak} vocabularyCount={vocabCount} testsPassed={testsPassed} unlockedBadges={badges} chartFilter={chartFilter} setChartFilter={setChartFilter} activityLog={activityLog} onShowTest={()=>setShowTest(true)} recurringMistakes={recurringMistakes} tipLog={tipLog} testFailedAt={testFailedAt} totalMsgCount={totalMsgCount}/>}
{tab==="vocab"&&<VocabTab vocabWords={vocabWords} studentLevel={level} savedWords={savedWords} setSavedWords={setSavedWords}/>}
{tab==="exercises"&&<ExercisesTab studentLevel={level} vocabWords={vocabWords} lessonNote={lessonNote} lessonVocab={lessonVocab}/>}

</div>
);
}
