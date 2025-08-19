import {gameCore, gameEntity, gameResources} from "game-framework";
import {unlocksApi} from "game-framework/src/general/unlocks-api";

export const achievementsDb = [{
    id: 'intro',
    title: 'Awakening',
    text: [
        "You open your eyes and find nothing but trees around you.",
        "Birds are singing, but the loudest sound is the growl of your empty stomach.",
        "Your muscles ache as you struggle to sit up. You glance around—seems safe enough. But the moment you move, the world spins.",
        "A few more minutes pass. No memories return. No answers come.",
        "One thing is clear: sitting on cold, damp ground forever isn't a great plan."
    ],
    completeCondition: () => gameEntity.getLevel('action_walk') < 2,
},{
    id: 'finished_demo',
    title: 'Congratulations',
    text: [
        'You\'ve reached the end of this demo — well done!\n' +
        'But your journey doesn’t have to stop here. The full game will go far beyond what you\'ve seen so far.',
        '<b>Add the game to your Steam Wishlist</b> to support development and be the first to know when it\'s released!',
        '<a target="_blank" href="https://store.steampowered.com/app/3678950/Idle_Awakening_Mages_Path/">Wishlist on Steam</a>',
        'You can keep playing if you’d like — no one\'s stopping you.'
    ],
    completeCondition: () => {
        if(!gameCore.demoVersion) return false; // Available only for a demo
        // Check shop upgrades
        const shopUpgrades = gameEntity.listEntitiesByTags(['shop']);
        const incompleteUpgrades = shopUpgrades.filter(one => !one.isUnlocked || (gameEntity.getEntityMaxLevel(one.id) && !one.isCapped));
        if(incompleteUpgrades.length) return false;
        // Check unlocks
        const data = unlocksApi.getGeneralUnlocksStats();
        if(data.total > data.totalCompleted) return false;

        return true;
    }
},{
    id: 'action_walking_1',
    title: 'The Shop Is No Longer a Boss Fight',
    text: [
        'You’re still out of breath, but at least a trip to the nearby store no longer feels like a near-death experience.'
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_walk') >= 10
    }
},{
    id: 'action_walking_2',
    title: 'Somewhat Bipedal',
    text: [
        "You've come a long way—literally.",
        "Once gasping after a few steps, you now glide through doorways with something resembling grace.",
        "Your couch misses you, but your legs are starting to believe they were made for this."
    ],
    completeCondition: () => gameEntity.getLevel('action_walk') >= 50
},{
    id: 'action_walking_3',
    title: 'Familiar Streets',
    text: [
        "Over time, even the local stray dogs seem to recognize you.",
        "You've begun mapping the settlement in your mind — its alleys, shortcuts, and familiar beggars.",
        "It’s not much, but these streets are slowly starting to feel like home."
    ],
    completeCondition: () => gameEntity.getLevel('action_walk') >= 100
},{
    id: 'action_walking_4',
    title: 'The Long March',
    text: [
        "You've walked so much, some villagers now refer to you as 'The Wanderer'.",
        "You've memorized every cobblestone, named every bush along your route, and developed strong opinions about which hill has the most scenic view.",
        "Yesterday, you walked so far you forgot why you even left in the first place.",
        "And everything would’ve been fine - if only you hadn’t forgotten the way back.",
        "On your return, you fought through nettle fields, survived a mosquito ambush, and crossed a river riding a floating log, nearly drowning three times in the process.",
        "Soaked, exhausted, but proud of your journey as a budding conqueror of distances, you finally went to sleep."
    ],
    completeCondition: () => gameEntity.getLevel('action_walk') >= 250
},{
    id: 'action_gossip_1',
    title: 'The Dragon and the Drifters',
    text: [
        "You found companionship in three local drifters who love sharing tales of their clearly fictional heroics.",
        "One of them was especially convincing when he claimed to have seen a dragon in the forest—and even wounded it with a slingshot.",
        "One day, you ventured into the woods to investigate, but found only pine trees... and some very strange mushrooms. Looking at them, you suspect you’ve uncovered the true source of the hunter’s 'success.'"
    ],
    completeCondition: () => gameEntity.getLevel('action_gossip') >= 10
},{
    id: 'action_gossip_2',
    title: 'The Art of Empathy',
    text: [
        "After days of consistent gossiping, you've become a trusted listener at the market.",
        "Today, someone told you a long, emotional story involving three cousins, two goats, and something about a cursed sock.",
        "You didn't fully understand what happened—but you gasped at all the right moments and nodded with convincing concern.",
        "By the end, they were crying, you were emotionally drained, and no one questioned your social expertise."
    ],
    completeCondition: () => gameEntity.getLevel('action_gossip') >= 25
},{
    id: 'action_gossip_3',
    title: 'Echoes of the Truth (Sort Of)',
    text: [
        "You've reached the highest circles of local gossip. Some even lower their voices when you walk by—not out of fear, but to make sure you don’t miss anything.",
        "Today, someone shared a juicy secret with you about a mysterious mage who once dated a duchess, tamed a wyvern, and accidentally turned a whole tavern into frogs.",
        "You smiled politely, recognizing it as the exact story you invented last month to amuse a bored baker.",
        "It's grown in scale, detail, and prestige—and frankly, you’re proud of how far it’s come without you."
    ],
    completeCondition: () => gameEntity.getLevel('action_gossip') >= 100
},{
    id: 'action_gossip_4',
    title: 'The Pink Shorts Revelation',
    text: [
        "After long conversations with neighbors about what color the mayor's daughter's dress was at the party, you realized that pink color drives people crazy. So you threw away your old pink shorts and bought new ones - white ones.",
        "Now people pay attention to you as a fashion icon, and local elders are trying to arrange your marriage to the mayor's daughter."
    ],
    completeCondition: () => gameEntity.getLevel('action_gossip') >= 1000
},{
    id: 'action_gossip_5',
    title: 'The Dragon Hunt',
    text: [
        "In pursuit of fame, you cannot ignore rumors.",
        "Yesterday you overheard a conversation between two people who saw a dragon and were discussing the direction it flew.",
        "You asked for details and set off in search. Locals pointed you in the direction where to look for the mountain peak where the dragon went.",
        "After three days of searching, you ran out of water and food. Nevertheless, you reached your destination - it turned out to be a dragon monument, which according to local legends protects the nearest settlements.",
        "Disappointed, hungry and thirsty, you descended and stopped at a settlement along the way. At least there you could eat something and sleep, even though everything was more expensive."
    ],
    completeCondition: () => gameEntity.getLevel('action_gossip') >= 2000
},{
    id: 'action_gossip_6',
    title: 'The Monster Fish Hunt',
    text: [
        "Your own rumors about a monster fish that was about to crawl onto land and destroy the entire settlement reached you.",
        "You learned about a guard squad that was going to hunt the big fish and protect the settlement, and decided to join them, explaining that you knew where to look for it.",
        "After several days of fishing, one of the guards finally caught a large pike. You, realizing there wouldn't be a better moment, quietly cast a spell on the pike. The pike instantly grew legs and started running at the catcher - the guard who caught it. The guard quickly drew his sword and cut the pike in half. The cut pike grew a new head and continued moving.",
        "You tried to cast a spell on the pike to kill it - however, the pike doubled again and continued the pursuit as an army of six pikes.",
        "The frightened sergeant climbed a tree, and the pikes tried to continue the chase while you and the rest of the guards watched from the side. Eventually, the pikes, after several failed attempts to grab the sergeant, started suffocating and fell near the tree.",
        "You triumphantly returned with several kilograms of pikes and cooked fish soup from them. This day is now officially the day of victory over the fish threat, and you and the young sergeant are true saviors of the settlement."
    ],
    completeCondition: () => gameEntity.getLevel('action_gossip') >= 5000
},{
    id: 'resource_coins_1',
    title: 'The First Clink',
    text: [
        "Your battle against the growling void in your stomach continues heroically.",
        "The few coins rattling in your pouch still aren’t enough to buy a loaf of bread.",
        "But somehow, you’re starting to look at that pouch with hope."
    ],
    completeCondition: () => gameResources.getResource('coins').amount >= 20
},{
    id: 'resource_coins_2',
    title: 'Scraping By, Gracefully',
    text: [
        "You're no longer begging on the streets with an empty stomach.",
        "You still glance wistfully at those lounging in the local tavern, feasting on roast turkey and clinking hefty mugs of ale.",
        "But the thought that your hand-picked forest berries are not only free but healthier brings you a strange sense of peace."
    ],
    completeCondition: () => gameResources.getResource('coins').amount >= 1000
},{
    id: 'resource_coins_3',
    title: 'From Rags to... Slightly Less Rags',
    text: [
        "Your growing fortune lets you look to the future with something resembling hope.",
        "Yesterday, while strolling through the town center, a few people tried to offer you spare change.",
        "So you bought yourself some new clothes—guilt-free. One small step from beggar to citizen, slowly moving up in life."
    ],
    completeCondition: () => gameResources.getResource('coins').amount >= 20000
},{
    id: 'resource_coins_4',
    title: 'Rich Enough to Be Lonely',
    text: [
        "You walk through the settlement in shiny new shoes, catching jealous glances from those who once shared a park bench with you.",
        "Your land holdings grow, and townsfolk consider it an honor just to exchange a few words with you.",
        "You start to wonder if anyone talks to you for reasons other than your wealth."
    ],
    completeCondition: () => gameResources.getResource('coins').amount >= 1000000
},{
    id: 'shop_item_hat',
    title: 'Your First Investment',
    text: [
        "After scraping together a few coins, you rushed to the nearest shop with a heart full of joy.",
        "That joy quickly gave way to disappointment. The shopkeeper glanced at your ragged clothes and trembling handful of coins, sighed, and disappeared into the basement.",
        "He returned a minute later with an old, dusty hat. Smiling faintly, he handed it to you: 'Here, at least your ears won’t freeze.'",
        "Realizing your wealth wasn’t exactly respected here, you accepted the hat and wandered off toward the town square.",
        "Well, at least now you're on par with the local drifters—who also have somewhere to collect spare change."
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_hat') >= 1
},{
    id: 'shop_tent_1',
    title: 'A Place to Call Slightly Yours',
    text: [
        "No more fighting local drifters for a spot on the park bench.",
        "With a sense of dignity, you grab your freshly purchased, neatly folded tent and head to the clearing just outside the settlement.",
        "The ground is still damp and cold, but you wisely laid down some pine needles beneath the canvas. Tonight, you fall asleep with a smile—and a hint of self-respect."
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_tent') >= 1
},{
    id: 'furniture_urn_1',
    title: 'The Rodent-Proof Bank',
    text: [
        "Your vast fortune is growing rapidly—and no longer fits in your hole-ridden sock.",
        "Today, in a desperate attempt at financial organization, you tried hiding your coins under your tent... only to watch them vanish into a mole hole.",
        "That was the last straw. You marched to the shop to buy your very first coin storage.",
        "As usual, the shopkeeper wasn’t impressed by your wealth, and all they offered was a rusty old urn.",
        "Still, it’s better than your leaky pockets, or feeding gold to moles, who are now objectively richer than you."
    ],
    completeCondition: () => gameEntity.getLevel('furniture_urn') >= 1
},{
    id: 'furniture_bookcase_1',
    title: 'Shelf of Enlightenment',
    text: [
        "You’ve officially begun your career as an intellectual.",
        "Inspired by your recent victory in an argument with a local wanderer—where you definitively proved that apples fall from trees rather than grow from the ground—you resolved to pursue your potential.",
        "With your remaining coins, you purchased a small, broken bookcase, then repaired it yourself so your three books could rest in comfort.",
        "Unfortunately, the bookcase now occupies the spot where you usually tossed apple cores. You'll have to start getting up at night to take them outside.",
        "But that’s the price of a meaningful, enlightened life. And you’re willing to pay it."
    ],
    completeCondition: () => gameEntity.getLevel('furniture_book_case') >= 1
},{
    id: 'shop_library_entrance_1',
    title: 'The Stubborn Scholar',
    text: [
        "You spent half an hour trying to convince the librarian that you can, in fact, read.",
        "Despite the clinking coins in your pocket, the scent of your outfit suggested 'wandering vagrant' more than 'refined intellectual.'",
        "Still, with sheer persistence and a few well-placed curses, you not only secured your pass—but even got a discount."
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_library_entrance') >= 1
},{
    id: 'action_read_motivation_book_1',
    title: 'Chapter One: Self-Delusion',
    text: [
        "Today at the shop, they handed you a book—at a discount, of course—for being a loyal buyer of cheap random junk.",
        "Judging by the cover, it had been on that shelf since the dawn of time.",
        "Still, this is your first real investment in personal growth.",
        "Filled with determination, you opened the small book and dove in. By page two, you realized you understood absolutely nothing—but somehow, that only motivated you more.",
        "After proudly finishing a whole three pages before bed, you drifted off inspired, certain that tonight you’ll dream of being an academic genius."
    ],
    completeCondition: () => gameEntity.getLevel('action_read_motivation_book') >= 2
},{
    id: 'action_learn_anatomy',
    title: 'Basic Anatomy, Big Revelations',
    text: [
        "Flipping through the book and studying the diagrams, you suddenly spotted something familiar.",
        "Turns out that strange bump on your cheek isn’t a cursed spirit—it’s just a pimple.",
        "Great news: you can cancel the exorcist appointment!"
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 10
},{
    id: 'action_learn_anatomy_2',
    title: 'The Liver Has Landed',
    text: [
        "After all that reading, you've finally figured out where your liver is located.",
        "You're still not entirely sure what to do with that knowledge, but your hand instinctively reaches to check if it’s still there after yesterday’s scuffle with the local thugs."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 25
},{
    id: 'action_learn_anatomy_3',
    title: 'Heartbeat and Hype',
    text: [
        "You've finally learned how to take your own pulse—and now do it regularly while climbing hills, just for fun.",
        "A friend called you a hypochondriac. You're not sure what it means, but whatever it is—it sounds impressive!"
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 100
},{
    id: 'action_learn_anatomy_4',
    title: 'A Painful Revelation',
    text: [
        "Your habit of opening the anatomy manual every time your side hurts or your arm itches is finally paying off.",
        "However, today — while climbing a hill — you felt more out of breath than usual, and your trusty book was nowhere nearby.",
        "For a brief moment, you thought you were dying. You clutched your side...",
        "And then remembered the side effect of that herbal remedy the local healer gave you yesterday to treat your hiccups.",
        "You suddenly realized that remembering herb names and their effects on the body has become second nature to you.",
        "A deep sense of pride washed over you."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 250
},{
    id: 'action_learn_anatomy_5',
    title: 'Spleen Supremacy',
    text: [
        "You've read enough anatomy to confidently identify organs most people don't even know exist.",
        "You now quietly judge anyone who can't point to their spleen.",
        "Not out loud, of course. You're educated, not rude."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 1000
},{
    id: 'action_learn_anatomy_6',
    title: 'The Satiety Spell Mishap',
    text: [
        "You learned to feel your own organs.",
        "After another meditation session, you were interrupted by hunger, so you decided to approach the problem radically - you cast a satiety spell on your stomach.",
        "For 30 seconds you felt pleasant fullness, however very soon this sensation changed to a feeling of sharp pain.",
        "Casting a pain relief spell, you lost consciousness.",
        "In the morning you woke up in the local psychiatric hospital, and spent a long time trying to explain that you weren't trying to commit suicide by eating yourself to death with stones.",
        "Miraculously convincing the doctors, you returned home and decided to eat exclusively in a natural way."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 2000
},{
    id: 'action_learn_anatomy_7',
    title: 'The Knee Cap Conspiracy',
    text: [
        "Studying human anatomy, you came to a terrible conclusion - cartilage is much weaker than bone, and the local bone setter is a charlatan!",
        "After long training sessions you felt immortal, however in the evening, reading a book after a long run, you sneezed and felt sudden pain in your knee. Getting up, you realized you couldn't properly step on your foot.",
        "The doctor said you had a dislocated kneecap. However, you are convinced this is impossible, as you have read tons of anatomy literature and never saw anything about such problems. Clearly they want to deceive you..."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 5000
},{
    id: 'action_learn_languages',
    title: 'Alphabetical Aggression',
    text: [
        "'Who came up with this many letters?!' you shout, flinging the book to the floor.",
        "Eventually, you regain your composure.",
        "At least now you know you were holding the book upside down when you tried to read it."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 10
},{
    id: 'action_learn_languages_2',
    title: 'Judging Books by Their Covers',
    text: [
        "You’ve finally started recognizing a few words here and there.",
        "Plus, you've memorized the color of the book’s cover—so now it's easier to pretend you know what you're reading."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 25
},{
    id: 'action_learn_languages_2_5',
    title: 'The First Translation',
    text: [
        "After weeks of study, your efforts have finally paid off: you've completed your first full translation.",
        "With great pride, you carefully deciphered an ancient text—only to realize it’s a long and overly poetic recipe for cabbage stew.",
        "Still, every great journey begins with a humble vegetable."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 50
},{
    id: 'action_learn_languages_3',
    title: 'Eloquent and Evicted',
    text: [
        "You finally gathered the courage to order a pint of ale in Old Elvish at the local tavern.",
        "They stared at you like a complete idiot, then brought you a glass of water and asked you to leave.",
        "But who are they to judge? Uneducated peasants! You owe them no explanations."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 100
},{
    id: 'action_learn_languages_4',
    title: 'Language Skills… and Stomach Pills',
    text: [
        "Today at the market, you were chatting with a friendly man who gathers berries and herbs in the forest and sells them.",
        "You've bought berries from him before, so once again you asked for your favorite – blueberries.",
        "However, mid-conversation, you accidentally switched to another language. The vendor, pretending to understand, nodded thoughtfully…",
        "And returned the next day with ten leaves of something that looked suspiciously like aloe vera.",
        "Not wanting to waste a perfectly good plant, you brewed a \"healing potion.\"",
        "You then spent the next half-day sitting in a meditative pose — not in pursuit of enlightenment, but because your stomach refused to cooperate.",
        "Still, you’ve learned a valuable lesson: not only have your language skills improved, but you now choose your words much more carefully — especially when it comes to food."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 250
},{
    id: 'action_learn_languages_5',
    title: 'The Hidden Treasure',
    text: [
        "You finally managed to read the inscription scratched on a board that you accidentally found while cleaning. It looks like directions to a hidden treasure.",
        "You diligently followed the instructions from the board, came to the apple tree and started digging. After digging about 30 centimeters, you found a box with 3 hidden coins.",
        "You remembered that a year ago you made this note on the board for yourself, so you wouldn't forget where you hid your wallet with coins."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 1000
},{
    id: 'action_learn_languages_6',
    title: 'The Pudding Spell Book',
    text: [
        "Your fellow villager, having heard about your skills in reading ancient languages, asked you to translate a spell book for him that he found under his pillow.",
        "No matter how hard you tried to translate it, it looked like a pudding recipe. However, the man was convinced it was a book of secret spells passed down to him by his mother. So you decided not to disappoint the man and read a spell from it.",
        "Suddenly, a pudding appeared on the table. The man clapped when his favorite cup suddenly turned into pudding. The man didn't have time to shout before his hat also turned into pudding.",
        "Realizing you had done something wrong, you carefully reread the last page of the book before the entire house turned into pudding. As it turned out, it was enough to cross your fingers and shout 'Done'.",
        "The next day, you and your new business partner were transforming human clothing and various unnecessary items into pudding on order, until the mayor passed by. Who knew he was allergic to strawberries, and there were important contracts in his briefcase...",
        "In the evening, at the tavern, you and your partner finished eating the strawberry pudding hidden in your pocket. It turned out to be so delicious that you even agreed it was worth the 2-day imprisonment."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 2000
},{
    id: 'action_learn_languages_7',
    title: 'The Linguistic Dinner Disaster',
    text: [
        "You were invited to a dinner by linguists who were researching the cultural influence of ancient Elvish on modern magical dialect.",
        "After eating a piece of fish, you felt that a bone got stuck in your throat. Wanting to get rid of the unpleasant sensation, you approached a mirror. Barely removing the bone, you felt relief.",
        "However, suddenly, the bone you had just removed from your throat turned into a giant shark. Everyone ran out of the hall in horror.",
        "You, remembering that fish cannot fly in the air and breathe without water, waited until the fish started suffocating and helplessly fell on its side, then cast a spell that evaporated the illusion.",
        "Coming out alive from the building, you caused incredible admiration among those around you."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 5000
},{
    id: 'action_pushup_1',
    title: 'Pushup Prodigy (Sort of)',
    text: [
        "Yesterday, you bet your friends you could do a hundred pushups. You did it with ease.",
        "Then they had the nerve to claim you’re supposed to push up from the floor, not the wall.",
        "Ignore them—they're just jealous of your magnificent physique."
    ],
    completeCondition: () => gameEntity.getLevel('action_pushup') >= 5
},{
    id: 'action_pushup_2',
    title: 'Functional Fitness',
    text: [
        "Your occasional workouts are finally paying off.",
        "Now, when returning from the market, you can carry both bags of strawberries in one hand—leaving the other free to enjoy some sausage on the way home."
    ],
    completeCondition: () => gameEntity.getLevel('action_pushup') >= 25
},{
    id: 'action_pushup_3',
    title: 'Muscles and Misjudgments',
    text: [
        "After weeks of training, your arms feel like steel and your ego like granite.",
        "You flex in front of a mirror and nod approvingly at your progress.",
        "Then the mirror falls off the wall—not from your aura, but because it was never hung properly."
    ],
    completeCondition: () => gameEntity.getLevel('action_pushup') >= 100
},{
    id: 'action_pushup_4',
    title: 'The Two-Chair Challenge',
    text: [
        "Feeling strong enough, you decided to carry two chairs at once during your usual furniture rearranging.",
        "Your arms didn't fail you, but the passage turned out to be too narrow.",
        "The tent shifted, and you had to test not only your strength but also your patience and mastery of colorful language."
    ],
    completeCondition: () => gameEntity.getLevel('action_pushup') >= 250
},{
    id: 'action_pushup_5',
    title: 'The Wolf and the Pants',
    text: [
        "You decided to take an evening stroll through the forest when you spotted a wolf.",
        "You ran as fast as you could to a tree and grabbed onto a branch with your hands.",
        "The wolf turned out to be patient and sat for a long time, watching with hungry eyes.",
        "Eventually, your hands couldn't hold on and slipped along the branches.",
        "But you got caught by your pants on a lower branch, which saved you.",
        "Now those pants are your talisman, which you wear to every training session, just in case your arms fail you again."
    ],
    completeCondition: () => gameEntity.getLevel('action_pushup') >= 500
},{
    id: 'action_pushup_6',
    title: 'The Hanging Workout',
    text: [
        "You decided that simply doing push-ups was no longer interesting.",
        "So you tied a rock to your legs for extra weight and climbed a tree to do pull-ups on a branch.",
        "After finishing your workout, satisfied with yourself, you decided to climb down.",
        "But trouble struck—the rope got caught on a branch, and you hung upside down in the air.",
        "You didn't have to call for help for long, but now many legends circulate about you!"
    ],
    completeCondition: () => gameEntity.getLevel('action_pushup') >= 1000
},{
    id: 'action_pushup_7',
    title: 'The Magic Mirror Incident',
    text: [
        "You're not admiring your biceps in the mirror for the first time.",
        "The time has come - you decided, and went to participate in a regional push-up tournament.",
        "You easily reached the 1/8 finals, but here a seven-time competition participant came out against you. You, assessing the chances, decided to use cunning and magic. After doing 15 push-ups, you paused, muttering a spell that was supposed to create a multi-ton invisible load on your opponent's back.",
        "Suddenly, you heard a crunch and fainted.",
        "Coming to your senses a few days later, you learned that the competition hall was equipped with magic reflectors, so the load fell on you.",
        "Well, at least you reached the 1/8 finals, and understood on your own spine that your magic works."
    ],
    completeCondition: () => gameEntity.getLevel('action_pushup') >= 2000
},{
    id: 'action_train_endurance',
    title: 'Jogging with a Purpose',
    text: [
        "You decided to go for an intense run.",
        "After 100 whole meters, your vision blurred and darkness crept in.",
        "You came to, gasping—but relieved. That’s exactly the distance from your 'home' to the shop with your favorite liver pastries."
    ],
    completeCondition: () => gameEntity.getLevel('action_endurance_training') >= 10
},{
    id: 'action_train_endurance_2',
    title: 'Swift Justice (Sort of)',
    text: [
        "Yesterday at the market, some scoundrel tried to steal your coin pouch as you pulled it from your pocket.",
        "After a brief chase, you caught the thief—feeling more confident in your body and endurance than ever before.",
        "The fact that he was on crutches is irrelevant."
    ],
    completeCondition: () => gameEntity.getLevel('action_endurance_training') >= 25
},{
    id: 'action_train_endurance_3',
    title: 'A Breeze of Triumph',
    text: [
        "Last night, you slept with your tent flap open—and for the first time, didn’t wake up sniffling.",
        "You finally felt what it means to be healthy.",
        "Though... having a warm cup of milk just in case wouldn’t hurt."
    ],
    completeCondition: () => gameEntity.getLevel('action_endurance_training') >= 100
},{
    id: 'action_endurance_training_4',
    title: 'The Marathon Disaster',
    text: [
        "You decided to run a marathon around the settlement.",
        "After completing half the route, you realized this wasn't the best idea.",
        "You hadn't accounted for the tall nettles along the path.",
        "Despite your heroism and perseverance, the forces were unequal.",
        "You had to return, with shame in your eyes and burns below your waist, past everyone who had seen your heroic start."
    ],
    completeCondition: () => gameEntity.getLevel('action_endurance_training') >= 250
},{
    id: 'action_endurance_training_5',
    title: 'The Mountain Challenge',
    text: [
        "You decided to climb the highest mountain in the area.",
        "Halfway up, you realized you had forgotten food and water.",
        "You had to fight for berries with a local moose.",
        "You had to descend, but you were still proud.",
        "Now you know that endurance is also about planning."
    ],
    completeCondition: () => gameEntity.getLevel('action_endurance_training') >= 500
},{
    id: 'action_endurance_training_6',
    title: 'The Horse Chase',
    text: [
        "A neighbor's horse knocked down your fence, and you chased it through half the settlement with colorful language.",
        "You tried to teach the violator a lesson.",
        "Finally, the horse stopped, waited for you, and as soon as you swung at the 'bandit'—it kicked you in the side with all its might.",
        "Despite the broken rib, you understood the main thing—even a horse couldn't get far away from you.",
        "You are as healthy as a horse!"
    ],
    completeCondition: () => gameEntity.getLevel('action_endurance_training') >= 1000
},{
    id: 'action_stamina_training_1',
    title: 'The Gossip Marathon',
    text: [
        "Today you accomplished more than usual—you visited all the local gathering spots to listen to gossip.",
        "You didn't even get tired.",
        "However, you had to hear stories about yourself and your 'outstanding physical condition' several times.",
        "Apparently, they didn't like that you can't climb the hill where your tents are located without getting out of breath."
    ],
    completeCondition: () => gameEntity.getLevel('action_stamina_training') >= 50
},{
    id: 'action_stamina_training_2',
    title: 'The Shortcut Disaster',
    text: [
        "You bet with a friend that you could reach the neighboring village faster.",
        "Deciding to take a shortcut, you chose a shorter path.",
        "However, you forgot that heavy rains had passed recently, and the stream you used to cross without problems now had to be swum across.",
        "Having an insane will to win, being a born champion, you rushed to swim across.",
        "However, you slightly miscalculated your strength...",
        "By evening, you woke up in the neighboring village's hospital with a cold and despair from the lost bet."
    ],
    completeCondition: () => gameEntity.getLevel('action_stamina_training') >= 100
},{
    id: 'action_stamina_training_3',
    title: 'The Endless Day',
    text: [
        "You decided to test your stamina limits.",
        "You worked in your garden all day, and after finishing, agreed to help your neighbors.",
        "Satisfied with your endurance, you settled down to sleep.",
        "Early in the morning, you were awakened by muscle soreness and a queue of people eager to help you test your endurance.",
        "You won't make such mistakes again."
    ],
    completeCondition: () => gameEntity.getLevel('action_stamina_training') >= 250
},{
    id: 'action_stamina_training_4',
    title: 'The Flying Lantern Chase',
    text: [
        "Yesterday you unsuccessfully used a spell to repel mosquitoes. Instead of creating a barrier, your furniture went crazy. The lantern decided to finally assert its independence, and after hitting you hard on the head, it flew out of the tent and into the forest.",
        "You rushed to catch up with it. After several hours of pursuit, you almost caught up with it. However, the lamp had its own plans - it suddenly turned around and flew straight at you.",
        "In the morning you woke up lying in the forest, with a broken forehead and the lantern in your hand.",
        "Tired but not broken, you return back - in the chase you still won, despite the knockout."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_stamina_training') >= 500
    }
},{
    id: 'action_stamina_training_5',
    title: 'The Sewing Machine Disaster',
    text: [
        "You have seriously taken up your physical training. Now you go for runs exclusively with additional weight.",
        "Today you decided to kill two birds with one stone. Your neighbor asked you to help him carry his sewing machine to the repair shop.",
        "You accepted this as a worthy challenge, so you grabbed the sewing machine and said you could carry it yourself. The neighbor looked at you with admiration, and this encouraged you even more.",
        "You confidently ran with it for about 50 meters when you started to feel that your breathing was letting you down. And everything would have been fine, but then a stone rolled under your feet. You sat down in a split with screams, and the machine, breaking free from your embrace, rolled down and, flying another 20 meters, fell to pieces.",
        "The admiration on the neighbor's face turned to horror, but you were no longer bothered by anything except unbearable pain.",
        "Looks like now you'll have to train for a week to apply pain-relieving balms. But at least the neighbor won't bother you with his requests anymore."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_stamina_training') >= 1000
    }
},{
    id: 'action_stamina_training_6',
    title: 'The Shadow Chase',
    text: [
        "Inspired by your athlete friends' shadow boxing practices, you decided to arrange a chase after your own shadow.",
        "After 10 miles, you finally managed to catch your own shadow, tripping over a stone and diving face-first into the grass.",
        "Your shadow seemed to mock you, dancing around. You tried to grab it, but it always slipped from your hands. Desperate, you decided to use magic - cast a spell that was supposed to 'attach' the shadow to the ground.",
        "The spell worked unexpectedly - your shadow became three-dimensional and started running around you like a real creature. Now you had a chase not after a flat shadow, but after a volumetric 'shadow clone'.",
        "After another 5 miles of running, you realized the shadow was trying to lead you to something. It stopped near an old oak tree, where you found a hidden treasure - a bag of coins you had forgotten there a year ago.",
        "Your shadow, satisfied that it helped you find the treasure, returned to normal state. Now you know that sometimes it's worth trusting even your own shadow, especially if it runs 15 miles in front of you."
    ],
    completeCondition: () => gameEntity.getLevel('action_stamina_training') >= 2000
},{
    id: 'action_cardio_training_1',
    title: 'The Heart Rate Challenge',
    text: [
        "You discovered that your heart rate increases significantly during intense activities.",
        "Excited by this discovery, you decided to test how long you can maintain maximum effort.",
        "During the jumping exercises, you landed awkwardly on a rock and sprained your ankle.",
        "Now you know that your heart is healthier than your leg.",
        "Apparently, normal people don't measure their heart rate by how many times they can jump in place."
    ],
    completeCondition: () => gameEntity.getLevel('action_cardio_training') >= 50
},{
    id: 'action_cardio_training_2',
    title: 'The Breathing Master',
    text: [
        "You've mastered the art of controlled breathing during intense workouts.",
        "Your lung capacity has increased so much that you can hold your breath underwater for impressive durations.",
        "You decided to demonstrate this skill at the local pond.",
        "Unfortunately, you forgot that the pond is only knee-deep, and your dramatic underwater performance looked more like you were trying to drink the water.",
        "The local children were thoroughly entertained by your 'swimming' technique."
    ],
    completeCondition: () => gameEntity.getLevel('action_cardio_training') >= 100
},{
    id: 'action_cardio_training_3',
    title: 'The Horse Replacement',
    text: [
        "Your neighbor's horse fell ill, and you decided to take advantage of the opportunity to test your strength.",
        "So you harnessed yourself to the plow and got to work.",
        "By evening, a crowd had gathered in the yard to watch the spectacle.",
        "They clapped and shouted slogans in your support.",
        "As a result, it all turned into a loud party in your honor."
    ],
    completeCondition: () => gameEntity.getLevel('action_cardio_training') >= 250
},{
    id: 'action_cardio_training_4',
    title: 'The Lost Book Panic',
    text: [
        "Yesterday you almost experienced clinical death.",
        "You woke up and looking at the table you didn't see your favorite book with instructions for conducting magical rituals.",
        "You frantically searched through all your belongings - but didn't find it.",
        "You ran to the library, hoping you had forgotten it there... You ran around all the places where you were yesterday, but all in vain. Finally, you ran into the trading tent where you got your favorite sausages yesterday - and it wasn't there either.",
        "You remembered how you loved that book. You understood little of it, but the illustrations of a mage conducting powerful rituals were always something particularly motivating for you...",
        "You felt sick right near the tent, so you were hospitalized. But today the doctor sent you home. He noted that you have a very strong heart, but recommended worrying less. He also gave you back the book, which you had apparently given him to read a week ago!",
        "Looks like it's time for you to continue working on improving your memory, otherwise cardio training won't help."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_cardio_training') >= 500
    }
},{
    id: 'action_cardio_training_5',
    title: 'The Handstand Challenge',
    text: [
        "Exhausting training continues to bring results, although they are not always unambiguous.",
        "You agreed to be an animator at a school for middle-aged children. You showed the kids magic tricks, taught them yoga exercises, and everything was going well until it came to an improvised physical education lesson.",
        "One boy showed how he can stand on his hands. You argued with the kids that you can walk on your hands, and can run around the school on them.",
        "You got ready, and confidently stood on your hands. After walking a few meters, you realized you could do it. But your confidence quickly turned to confusion. Not seeing where you were going, you left the path and flew down. Finally, your flight ended with an epic collision with an old oak tree growing nearby.",
        "The kids laughed. You got up with a feeling of anger and shame, and after muttering a spell, you gave the tree a good kick. A second later you were lying down again, this time writhing in pain in your leg. Ugh, even here the oak won. But it was a fair fight!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_cardio_training') >= 1000
    }
},{
    id: 'action_cardio_training_6',
    title: 'The Log Incident',
    text: [
        "You decided to try new breathing practices during cardio training.",
        "Exhaling after another step uphill with a log in your hands, you saw a strange silhouette in front of you.",
        "Surprised, you dropped the log from your hands. Hitting you hard on the legs, it pulled you down. You tumbled for a long time before your epic flight ended.",
        "You looked up - and saw no silhouette. Only the path you flew down... And the log flying straight at you.",
        "The next day you woke up in the hospital. The doctor, without even asking anything, gave you a pill and sent you away with the words: When will you finally kill yourself..."
    ],
    completeCondition: () => gameEntity.getLevel('action_cardio_training') >= 2000
},{
    id: 'action_yoga_practice_1',
    title: 'Breathless Enlightenment',
    text: [
        "Just yesterday, you read about yoga—and one evening was enough to discover a typo in the guide.",
        "Turns out you were supposed to hold your breath for five <strong>seconds</strong>, not <strong>minutes</strong>.",
        "Thankfully, you were practicing outside, and a passing local doctor ensured your swift delivery to the hospital instead of the cemetery."
    ],
    completeCondition: () => gameEntity.getLevel('action_yoga_practices') >= 5
},{
    id: 'action_yoga_practice_2',
    title: 'Inner Peace… Mostly',
    text: [
        "You can feel yourself becoming calmer.",
        "Just yesterday, you managed to listen to an old lady’s entire story about growing pineapples in her backyard—without developing an eye twitch.",
        "You almost didn’t want to kill anyone. Almost."
    ],
    completeCondition: () => gameEntity.getLevel('action_yoga_practices') >= 25
},{
    id: 'action_yoga_practice_3',
    title: 'Almost Enlightened',
    text: [
        "You continue cultivating your inner harmony.",
        "Today, you practiced yoga for a full hour... well, almost a full hour.",
        "If only that delicious smell of roast turkey from the nearby tavern hadn’t broken your focus."
    ],
    completeCondition: () => gameEntity.getLevel('action_yoga_practices') >= 100
},{
    id: 'action_yoga_practice_4',
    title: 'The Harmony Master',
    text: [
        "You met a self-proclaimed 'yoga master' who promised to teach you the most effective exercises for developing harmony between body and soul.",
        "His 'unique' techniques involved standing on your head while balancing a pot of boiling water on your feet.",
        "The master assured you that true enlightenment comes through overcoming physical limitations.",
        "Your body and soul achieved perfect harmony—in the local hospital, where they treated your dislocated spine.",
        "Your back will remember this lesson for a very long time. At least now you know that not every 'master' is actually a master."
    ],
    completeCondition: () => gameEntity.getLevel('action_yoga_practices') >= 250
},{
    id: 'action_yoga_practice_5',
    title: 'The Professional Instructor',
    text: [
        "Confident in your yoga skills, you decided to start offering paid lessons to the townsfolk.",
        "You set up a beautiful outdoor studio with mats and incense, ready to share your wisdom.",
        "After the first lesson, not a single student returned for the second session.",
        "However, the local chiropractor approached you with an interesting business proposal.",
        "He suggested a collaboration: you continue teaching yoga, and he handles the resulting injuries.",
        "It's not exactly the spiritual enlightenment you were aiming for, but at least it's honest work."
    ],
    completeCondition: () => gameEntity.getLevel('action_yoga_practices') >= 500
},{
    id: 'action_yoga_practice_6',
    title: 'The Levitating Charity Class',
    text: [
        "You continued organizing yoga courses. This time you decided to organize a charity yoga retreat for the homeless. What's more, you know many of them personally from the times when you fought with them for the best bench in the park. So the event turned out to be well-attended.",
        "However, during the class your back seized up. But you couldn't interrupt the lesson and call the osteopath. So you, trying not to show that something had gone wrong, attempted to whisper a healing spell for your back. However, you pronounced it too loudly, so the attendees repeated after you, thinking it was part of the yoga practice.",
        "As it turned out, you had mixed up the spell. The people in the hall began to levitate. Everything turned into chaos - some were excitedly shouting: 'Hurray, I'm flying', others were crying that they were afraid of heights and didn't want to die.",
        "It took 5 minutes before you managed to pull yourself together and lower everyone to the ground.",
        "By evening, rumors about incredible yoga practices had spread throughout the settlement, and by the next day you couldn't walk down the street without being asked when the next classes would be. With such fame, you can even aspire to become a world-famous yoga master!"
    ],
    completeCondition: () => gameEntity.getLevel('action_yoga_practices') >= 1000
},{
    id: 'action_meditate_1',
    title: 'The Magic Meditated Back',
    text: [
        "You've firmly decided to pursue magical practices.",
        "Though after today's vision during meditation, you're starting to suspect the magic is the one practicing on <strong>you</strong>.",
        "Following a brief conversation with two elves, you were prescribed a hefty dose of sedatives and ordered to visit a doctor daily for the next week."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 5
},{
    id: 'action_meditate_2',
    title: 'Master of Mindfulness (Mostly)',
    text: [
        "Your knowledge of meditative practices has earned widespread respect.",
        "You began offering public meditation lessons to the townsfolk.",
        "Unfortunately, the lesson had to be cut short by the local patrol—who woke you up from a deep, accidental nap halfway through."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 25
},{
    id: 'action_meditate_25',
    title: 'Elevated Perspective',
    text: [
        "Your meditation skills have reached a level where sitting on a mat just feels... uninspired.",
        "So you decided to seek a more meaningful location. Recalling the apple tree on the nearby hill with a stunning view of the river, you climbed up without hesitation.",
        "You munched on a few sour, unripe apples and settled on a branch, surrounded by nature’s beauty.",
        "The sound of the river flowed like the most serene melody you’ve ever heard.",
        "Then you woke up mid-air, realizing you were falling.",
        "You hit the ground, brushed off the dust, muttered a few choice words… and then noticed you had landed directly on an anthill.",
        "You sprinted to the river, fleeing the swarm of furious ants defending their honor with dozens of stinging bites.",
        "Still, alongside spiritual growth and inner strength, you gained a bruised shoulder and a brand new phobia. Not a bad bonus."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 50
},{
    id: 'action_meditate_3',
    title: 'Hot Thoughts, Fast Reactions',
    text: [
        "Your magical focus and inner power are growing so rapidly that your body can't quite keep up.",
        "During your latest meditation session, you accidentally sat on a magical rune.",
        "You shot out of your tent like a flaming demon splashed with holy water. Luckily, you had recently moved your camp closer to the river—otherwise, you'd have had exactly one second to invent a spell for summoning a well."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 100
},{
    id: 'action_meditate_4',
    title: 'The Bear Incident',
    text: [
        "Deep in meditation in the forest, you were suddenly interrupted by rustling bushes and heavy footsteps.",
        "Convinced it was a bear, you panicked and shouted the first spell that came to mind.",
        "The 'bear' fell to the ground with a loud thud, followed by even louder cursing.",
        "It was then you realized that bears don't typically curse in the local dialect.",
        "Turns out it was the local forester who had been watching your meditation sessions with great interest.",
        "Fortunately, your spell misfired and only caused a minor stuttering problem. You had to escort him to the healer for an anti-stuttering potion.",
        "The forester now gives you a wide berth, but at least you've proven that your magic can affect something other than your own concentration."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 250
},{
    id: 'action_meditate_5',
    title: 'The Mysterious Stranger',
    text: [
        "It was quite hot outside, so you decided to dedicate the day to spiritual practices by the river. You spread out your herbal mat, cooled off in the water, returned to the shore, and began meditating. Birds were singing around you, and the sounds of flowing water lulled you.",
        "Suddenly your sleep was interrupted by a magical but eccentric stranger. She approached within about 20 meters and stared at you intently.",
        "'Who are you?' you asked confusedly.",
        "The stranger silently muttered some spell and disappeared.",
        "You felt incredible lightness. With a wave of your hands, you effortlessly lifted off the ground and began gliding over the forest. The cool breeze pleasantly tickled your face.",
        "Suddenly the wind began to rise. You realized you needed to land on the ground. But you didn't know how. 'Need to go down' you started muttering, getting louder and louder.",
        "'Need to go down...' It was with this phrase that you woke up and saw the figure of a doctor above you.",
        "'Thank God, man. I was already thinking you wouldn't wake up, and our settlement would die of boredom.'",
        "He told you that a local fisherman had found you when you were unconscious lying in the sun. Another half hour - and sunstroke could have been fatal."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 500
},{
    id: 'action_meditate_6',
    title: 'The Healing Aura',
    text: [
        "In the morning, as usual, you went out to the clearing and immersed yourself in sweet meditation.",
        "However, your feeling of inner harmony and peace was interrupted by the sensation of something warm and wet on your cheek.",
        "Opening your eyes, you saw a cow beside you. She looked at you with a calm gaze and licked your face again.",
        "Dissatisfied with the interrupted meditation, you told the cow everything you thought about her and headed home. You noticed that the cow was following you. You tried to drive her away, but it didn't work.",
        "The cow led you almost home when you saw a fellow villager beside himself with happiness.",
        "'Lucy! Luuucy!' he began shouting and ran to hug the cow.",
        "'Where did you find her? She's been sick for the last month, and a week ago she completely disappeared somewhere, I thought she had died!'",
        "'I was just meditating on the clearing, and...'",
        "The man, without listening to you, exclaimed: 'You healed her! I understand, you healed her!'",
        "After kissing your hands and the cow's face, the man beside himself with happiness went on his way, the cow obediently followed him, only once turning to look at you as if thanking you.",
        "Finally, you came to realize the power of your aura. What fame, what prospects are opening up before you!",
        "Well, at least veterinary prospects definitely smiled at you today."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 1000
},{
    id: 'action_meditate_7',
    title: 'The Regional Meditation Champion',
    text: [
        "Your ability to immerse yourself and find inner balance has reached a regional level.",
        "You were invited to a monastery 400 miles from your home for a meditation competition. After several hours of travel under the scorching sun, the horses couldn't withstand the heat. So you had to stop. You stopped by the river, drank some water, and decided to practice meditation.",
        "You woke up already in the monastery. The first thing you saw was the face of a monk who was sprinkling you with holy water. You asked him when and where the competition would take place, and to your surprise, you learned that you had already won in the 'deepest meditation' category.",
        "Unfortunately, they didn't give you medals, so you asked the monk for a certificate in the 'Soundest Sleep' category. Nevertheless, you felt sleep-deprived, so you slept through most of the journey back."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 2000
},{
    id: 'action_home_errands_1',
    title: 'The Relic of Cleaning',
    text: [
        "While carefully tidying the area around your tents, you discovered a strange wooden object with a shiny golden tip.",
        "Overjoyed, you rushed to the local expert on magical relics and ancient artifacts.",
        "The man gave the item—and you—a puzzled look, then asked why you'd brought him the leg of an old chair.",
        "You left his hut, deeply disappointed. He didn’t even <strong>look</strong> properly. As always, you'll just have to figure it out yourself."
    ],
    completeCondition: () => gameEntity.getLevel('action_home_errands') >= 10
},{
    id: 'action_home_errands_2',
    title: 'Justice, Misplaced',
    text: [
        "After another round of deep cleaning, you were hit by a wave of mixed emotions.",
        "You found your old coin pouch—with a few coins still inside. You were certain it had been stolen, so the joy was immense… briefly.",
        "Then came the guilt: you remembered the days spent tracking down the 'thief' and giving him what you thought he deserved.",
        "But don’t worry—his bruises are long gone. And really, a bit of preventive justice never hurt anyone."
    ],
    completeCondition: () => gameEntity.getLevel('action_home_errands') >= 25
},{
    id: 'action_home_errands_2_5',
    title: 'Domestic Ambitions vs. Weather Gods',
    text: [
        "You woke up today with a firm conviction: it's time for serious change. And serious change begins with reorganizing your living space.",
        "You carefully rearranged your belongings, set up a dedicated dining area, moved your reading supplies into a separate tent—your very own study hall!",
        "You even created a special place for trash collection. Things were finally coming together.",
        "Then the rain started. Heavy rain. Turns out placing your trash zone on a hill was a bad idea.",
        "Rushing water elegantly redistributed your waste across the entire camp.",
        "Nature clearly had its own ideas about landscaping. At least now you know: it's time to find higher ground for your tents."
    ],
    completeCondition: () => gameEntity.getLevel('action_home_errands') >= 50
},{
    id: 'action_home_errands_3',
    title: 'Order… or Something Like It',
    text: [
        "After hours of relentless cleaning, your territory now resembles something slightly neater than a full-blown garbage heap.",
        "Sadly, aside from the legendary chair leg, no valuable artifacts were found. But at least you finally remembered where you hid your wooden table to keep it dry, and finding a specific book no longer causes a panic attack.",
        "You are, however, now on your fourth pair of replacement glasses. The previous ones remain missing in action."
    ],
    completeCondition: () => gameEntity.getLevel('action_home_errands') >= 100
},{
    id: 'action_home_errands_4',
    title: 'The Domestic Philosopher',
    text: [
        "After five hundred sessions of what you've come to call 'organized chaos management,' you've achieved something remarkable.",
        "Your camp now has designated zones for everything: a proper kitchen area with a stone fire pit, a reading nook under the largest tree, even a 'guest area' for the rare visitor who doesn't immediately flee from your eccentric lifestyle.",
        "You've developed a system so efficient that you can find any item within thirty seconds—a personal record that would impress even the most organized librarian.",
        "The local merchants have started referring to you as 'that person who actually knows where their things are.' It's not exactly the title you dreamed of, but it's honest recognition of your domestic achievements.",
        "Your organizational skills have become legendary. Rumor has it that even the town's mayor considered hiring you to reorganize the city hall, but decided against it after seeing your 'creative' filing system."
    ],
    completeCondition: () => gameEntity.getLevel('action_home_errands') >= 500
},{
    id: 'shop_item_less_illusion',
    title: 'First Contact (Almost)',
    text: [
        "At last, the day has come! You've purchased the long-awaited 'Magic of Illusions' and race home to read it.",
        "Lighting a candle and sealing yourself away from the ever-persistent mosquitoes, you settle into your chair and brush the dust from the cover.",
        "In your excitement, the book slips from the table. A sudden flash blinds you—followed by the appearance of a terrifying figure through what seems to be a portal.",
        "You blink, paralyzed in fear… only to realize it's just a city guard holding a very large gas lamp.",
        "Turns out your tent is now on land owned by the local lieutenant of the guard. Not quite a demon, but almost as scary."
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_less_illusion') >= 1
},{
    id: 'shop_item_less_restoration',
    title: 'The Secret to Eternal Youth (Kind Of)',
    text: [
        "You eagerly open your newly purchased tome, hoping to uncover the long-lost spell of eternal youth.",
        "As you skim through the pages, a familiar ingredient catches your eye. Your heart skips a beat—you look up to read the title of the spell.",
        "Wait... what? A wart removal charm?"
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_less_restoration') >= 1
},{
    id: 'shop_item_spellbook',
    title: 'The Power of Abracadabra',
    text: [
        "The day has come! You convinced the old archmage in the shop that you’re finally knowledgeable enough to try magic without burning down the town.",
        "Grabbing your scroll, you sprint straight to the tavern.",
        "You lock eyes with the burly man who still refuses to repay his debt, point the scroll at him, and boldly shout: 'Abracadabra!'",
        "The room erupts in laughter. The man, thoroughly amused, claps you on the back and tosses you a few coins for the entertainment.",
        "Later that night, on his way home, he returns your debt down to the last coin.",
        "Magic clearly works—that’s the thought you fall asleep with."
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_spellbook') >= 1
},{
    id: 'action_gathering_1',
    title: 'A Valuable Discovery (Probably)',
    text: [
        "Today, after a week of fruitless searching, you finally found something truly valuable—a young money tree sapling.",
        "Many claim it’s just a common beech, but your childhood friend once told you it's a money tree.",
        "And frankly, if someone doesn’t know botany, they should keep their unsolicited opinions to themselves."
    ],
    completeCondition: () => gameEntity.getLevel('action_gather_carefully') >= 10
},{
    id: 'action_gathering_2',
    title: 'Poison, Practice, and Friendship',
    text: [
        "Through careful experimentation (and some questionable decisions), you've finally identified which berries require you to stay near the local clinic.",
        "On the bright side, you’ve gotten to know the town healer quite well—after your near-daily visits for food poisoning, you’re practically family.",
        "He even invites you over for dinner now and then. Hopefully not to test new recipes."
    ],
    completeCondition: () => gameEntity.getLevel('action_gather_carefully') >= 50
},{
    id: 'action_gathering_3',
    title: 'The Price of Beauty',
    text: [
        "Hill after hill, you explored the outskirts of town.",
        "Yesterday, you set off on a longer expedition—tent and kettle in hand.",
        "You returned this evening with valuable finds: a tick in your arm, a sprained ankle, and some impressively itchy nettle burns.",
        "But you also discovered a hilltop with a breathtaking view of the city.",
        "Wounds will heal, but the memory of that glorious sunset, set to the soothing buzz of mosquitoes, will stay with you forever."
    ],
    completeCondition: () => gameEntity.getLevel('action_gather_carefully') >= 100
},{
    id: 'shop_item_land',
    title: 'Landowner Dreams',
    text: [
        "It may only be a modest patch of dirt, but it’s <strong>your</strong> patch of dirt.",
        "You stand proudly on your new property, envisioning a majestic estate, magical gardens, perhaps even a tower.",
        "Right now it’s just rocks, weeds, and a suspiciously aggressive squirrel—but the future is bright!"
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_land') >= 1
},{
    id: 'shop_item_land_2',
    title: 'The Estate Expands',
    text: [
        "You now own five whole plots of land. The townsfolk have started calling you 'the landlord'—mostly ironically.",
        "Yesterday, a chicken wandered across all five plots in under a minute. You chased it off with a stick and a speech about property rights.",
        "The chicken didn’t seem impressed, but you felt powerful. That counts for something."
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_land') >= 5
},{
    id: 'action_walking_433',
    title: '',
    text: [
        ''
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_walking') >= 100000
    }
},{
    id: 'knowledge_500',
    title: 'The Charity Quiz Champion',
    text: [
        "Today you met a man you used to cross paths with frequently at the free food distribution point. Obviously, your paths have diverged since then. But the man hasn't forgotten how you changed clothes three times to look like a different person, and shared extra portions.",
        "So he informed you about a charity quiz being held among the homeless, where prizes were offered — specifically, free education and accommodation for a while. You thought about refusing, since you left the times of poverty far behind.",
        "But your thirst for victory convinced you to find your old shirt and dress up as a destitute street singer.",
        "And so, you answered all 30 questions, and in anticipation of the reward, you step onto the stage. But something went wrong — the local librarian, who was awarding medals, recognized you.",
        "Instead of medals, punches awaited you, though your self-admiration didn't suffer from this — you won, and winners aren't judged!"
    ],
    completeCondition: () => {
        return gameResources.getResource('knowledge').amount >= 500
    }
},{
    id: 'action_woodcutting_50',
    title: 'The Axe Whisperer',
    text: [
        "You've finally figured out which end of the axe to hold. But you still haven't learned to avoid hitting exactly where you're not supposed to.",
        "After your tenth trip to the master craftsman, you decided to learn how to repair your tool yourself. The constant visits were starting to affect your reputation — and your wallet.",
        "Yesterday, while attempting to chop a particularly stubborn oak, your axe handle cracked in half. Instead of panicking, you calmly examined the damage, gathered some sturdy branches, and spent the evening crafting a new handle.",
        "The result wasn't pretty, but it held together. Today, you're back in the forest, swinging your homemade creation with renewed confidence.",
        "True champions only grow stronger after defeats — and you're starting to feel like a real lumberjack, even if your trees sometimes look more like abstract art than firewood."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_woodcutter') >= 50
    }
},{
    id: 'action_woodcutting_100',
    title: 'The Accidental Axe Champion',
    text: [
        "Today you won an 'unexpected competition' in axe throwing, without even wanting to. You were doing your usual logging work when, mid-swing, you miscalculated, and the axe slipped from your hands.",
        "After spinning through the air for what felt like an eternity, it masterfully knocked the hat off the head of a passing village elder. The precision was impressive — if only it had been intentional.",
        "Despite your pride in the accuracy, you spent the entire day convincing the local council of elders not to ban you from logging in the settlement area.",
        "Your argument about 'demonstrating exceptional axe control' didn't quite land as intended, but eventually they agreed that accidents happen to everyone.",
        "Now you're back to chopping wood, though you've developed a habit of checking for any approaching officials before each swing. The elders still give you nervous glances when you pass by the village square."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_woodcutter') >= 100
    }
},{
    id: 'action_quarrying_50',
    title: 'The Stone Whisperer',
    text: [
        "You spent a long time trying to figure out what to do with the pickaxe. Eventually, you decided to throw it aside and try breaking stone with your bare hands, which sincerely amused the local stonemasons.",
        "At first, they watched your attempts with a mix of confusion and pity. But as the day wore on, your determination — if not your technique — began to earn their respect.",
        "By evening, leaving the tavern together with them, you realized you had found yourself friends. The laughter had turned into camaraderie, and your bruised knuckles became a badge of honor.",
        "Happiness isn't in the stone, right? But it might just be in the company of those who understand the value of persistence, even when it looks ridiculous.",
        "Now you're back at the quarry, this time with proper tools and a group of friends who occasionally still chuckle at your early attempts, but always share their lunch and their wisdom."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_quarrying') >= 50
    }
},{
    id: 'action_quarrying_100',
    title: 'The Fossil Finder',
    text: [
        "You've finally mastered the pickaxe properly. The stones still don't come out even, often they're jagged and rough. But today, you found something extraordinary in yet another split rock — what appeared to be a trilobite fossil.",
        "Excited by your discovery, you carefully carried it to the local paleontologist, imagining yourself as a great explorer of ancient times.",
        "However, he refused to take it, claiming it was just someone's old shoe that got stuck in mud and dried up. His scientific expertise was apparently not impressed by your 'prehistoric footwear.'",
        "Undeterred by his skepticism, you kept the fossil for yourself. Now, every time you look at it, you proudly display your 'paleo-shoe' to anyone who will listen.",
        "The stones may still be uneven, but you've found something even more valuable — a story that gets better with each telling, and a fossil that's definitely not just an old shoe. Probably."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_quarrying') >= 100
    }
},{
    id: 'action_craft_1',
    title: 'Stick Perfection',
    minDemoVersion: 20,
    text: [
        "Lately, you've taken a keen interest in woodworking and handmade crafts.",
        "Today, inspiration struck—why not try selling handmade wooden souvenirs?",
        "You picked up a promising log and dragged it home. Or at least tried to. After 50 meters of struggling and seeing stars, you realized your spine was losing the duel.",
        "Switching to a lighter branch, you spent hours working on it with care and determination.",
        "Now, as you gaze at your finished piece — a smooth stick with the bark peeled off — you feel a bit of pride. It may not be a masterpiece, but it's huge stick, and, sure, it looks... presentable."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_craft') >= 2
    }
},{
    id: 'action_craft_2',
    title: 'A Chair Worthy of Legends (Almost)',
    minDemoVersion: 20,
    text: [
        "Encouraged by your recent success, you decided to create something more advanced — a proper wooden stool.",
        "After hours of sawing, drilling, and nailing, the masterpiece was ready. You placed it in the middle of your tent and proudly sat on it.",
        "The stool lasted just long enough for you to think, “I'm actually pretty good at this.”",
        "Then it cracked, folded in half, and threw you to the ground along with your fragile sense of achievement.",
        "A bruised hip and a splinter in your back — not quite the fame you hoped for. But hey, even great craftsmen have to start with deadly prototypes."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_craft') >= 50
    }
},{
    id: 'action_craft_3',
    title: 'The Shelf of Trust',
    minDemoVersion: 20,
    text: [
        'Two days ago, when you walked into the shop, you stumbled upon an unusual scene — tools scattered all over the floor and the shopkeeper sitting in the middle of the chaos, eyes filled with frustration and despair. Turns out, the shelf where he stored his goods had collapsed completely.',

        'He promised you a nice discount in exchange for repairs, so you eagerly got to work. A few planks, some nails, and a healthy dose of swearing — and voilà, a new shelf stood proud and steady. Or so it seemed.',

        'This morning, just as the sun peeked over the horizon, you were already at the shop’s door, dreaming of cheap mana and discounts on tools and sausage. But instead of the familiar shopkeeper, a younger man greeted you with a puzzled look.',

        '“Ah, you must be the ‘carpenter’? Well... my colleague’s in the hospital. Said the shelf collapsed on him when he tried to grab a hatchet from the top.”',

        'You freeze, offering an awkward smile. Looks like those discounts won’t be happening after all. Still, in your defense — those weren’t exactly premium nails he gave you to work with...'
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_craft') >= 100
    }
},{
    id: 'shop_item_weird_painting_1',
    title: 'Weird Memories',
    minDemoVersion: 20,
    text: [
        'An odd, blurry painting you found tossed between dusty jars and oily rags at the back of a store. The artistic quality is… debatable. You’re not quite sure whether it’s a lake with reeds or a forest under a blue sky.',
        'And yet, as you stared at it, a strange feeling washed over you — a sense of warmth, nostalgia, maybe even joy.',
        'A flicker of memory surfaced: running as a child near a lake, whacking tall reeds with a stick like they were fierce monsters. That’s all you could recall.',
        'But somehow, that was enough. The painting now hangs proudly in your tent, quietly inspiring you whenever you glance at it.'
    ],
    completeCondition: () => {
        return gameEntity.getLevel('shop_item_weird_painting') >= 1
    }
},{
    id: 'action_crafting_training_1',
    title: 'The Carpenter\'s Face',
    text: [
        "Today at the shop, a man asked if you were a carpenter by any chance.",
        "You were incredibly pleased that your craftsmanship was now written all over your face.",
        "However, when you asked 'How did you know?', the man confessed that he had seen you yesterday carrying out the twentieth failed attempt at constructing an even bench that would fit between the tents.",
        "Now you take out the trash at night."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_crafting_training') >= 50
    }
},{
    id: 'action_crafting_training_2',
    title: 'The Wooden Horse Champion',
    text: [
        "Today there was a competition for the best wooden craft, and you won!",
        "At least that's what your friends told you, with whom you spent the evening drowning the sorrow of unrecognized talent.",
        "Nevertheless, your wooden horse now stands in the sergeant's yard.",
        "He even paid a few coins, saying it would be good to prop up his falling antique table that he inherited from his grandfather."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_crafting_training') >= 100
    }
},{
    id: 'action_crafting_training_3',
    title: 'The High Art of Stools',
    text: [
        "Your work has started bearing fruit—this week, two people already praised your homemade stools.",
        "However, for some reason, no one dared to sit on them.",
        "But you understand that they simply didn't dare touch high art."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_crafting_training') >= 250
    }
},{
    id: 'action_alchemy_training_1',
    title: 'The Memory Elixir Incident',
    text: [
        "And so, you seriously decided to study the secrets of potion brewing.",
        "After buying another recipe, you enthusiastically returned home to prepare a memory elixir.",
        "Finishing the brewing, you drank a glass without waiting for it to cool down.",
        "Suddenly you remembered that you forgot to check the dosage.",
        "By evening, you had to chat with fairies and unicorns.",
        "Towards nightfall, a prophet descended to you and said that you are the very hero the world needs.",
        "In the morning, you woke up on the floor, understanding that the memory elixir really helped—you'll remember yesterday for the rest of your life, as well as the fact that you need to pay attention to dosage."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_alchemy_training') >= 50
    }
},{
    id: 'action_alchemy_training_2',
    title: 'The Sweet Elixirs',
    text: [
        "Daily alchemy practice is bearing fruit.",
        "You've now learned to add sugar and honey to your elixirs.",
        "Maybe your muscles haven't become like a tiger's, but at least they're tasty."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_alchemy_training') >= 100
    }
},{
    id: 'action_alchemy_training_3',
    title: 'The Youth Elixir Business',
    text: [
        "Neighbors have started visiting you more and more often, praising your youth elixir.",
        "Many note the effect after just the third dose.",
        "However, for some reason everyone calls it 'cherry brandy' among themselves.",
        "The other day, the patrol visited you and threatened arrest for illegal distribution of alcohol.",
        "Well, had to choose a different direction in alchemy."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_alchemy_training') >= 250
    }
},{
    id: 'shop_item_magic_accessories_access_1',
    title: 'The Accidental Mage',
    text: [
        "After a long argument with the shopkeeper about being a real mage, you decided to prove your magical abilities.",
        "You tried to demonstrate by moving a small object with your mind, but nothing happened. The shopkeeper smirked.",
        "Frustrated, you muttered what you thought was a harmless phrase under your breath.",
        "Suddenly, a powerful gust of wind erupted from your hands, creating a miniature tornado that scattered books, papers, and various trinkets across the entire shop.",
        "The shopkeeper's face went pale as he watched his carefully organized merchandise fly around the room.",
        "You spent the rest of the evening helping him clean up the mess, apologizing profusely while secretly marveling at your unexpected magical outburst.",
        "Now the shopkeeper is terrified of you and lets you access the magical accessories section without any questions.",
        "At least you finally got what you wanted—though not exactly the way you planned."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('shop_item_magic_accessories_access') >= 1
    }
},{
    id: 'shop_item_enchanted_scissors_1',
    title: 'The Cursed Haircut',
    text: [
        "After purchasing your enchanted scissors, you were so excited that you immediately ran to show them to your neighbor.",
        "You explained that these were special scissors designed for paper crafting and enchanted paper production.",
        "Your neighbor, however, was more interested in their potential for a haircut. Despite your warnings, he insisted on borrowing them.",
        "The next day, he returned with the scissors, sporting a bizarre hairstyle with aloe vera leaves and cactus pieces stuck to his head.",
        "He was furious, shouting about how you should have warned him that the scissors were cursed.",
        "You calmly reminded him that you had specifically told him they were for paper, not for cutting hair.",
        "He stormed off, muttering about magical equipment safety warnings, while you quietly returned to your paper crafting with a satisfied smile."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('shop_item_enchanted_scissors') >= 1
    }
},{
    id: 'shop_item_constructing_1',
    title: 'The Moose Incident',
    text: [
        "Today you woke up to a terrible scream from the street. In panic, you jumped out of your bed and accidentally kicked the table leg in your haste. The table collapsed, spilling all your ginger tea onto the bed and your favorite biology textbook.",
        "Rushing out of the tent, you saw a smug moose face staring at you with its inscrutable eyes. After chewing another clump of moss, it let out another scream that sounded eerily similar to that man you chased last week, trying to make him pay back his debt.",
        "You cursed the moose with some choice words and returned to the tent to repair the table. A thought crossed your mind - the tent wasn't the best accommodation, and you could definitely make a sturdier table.",
        "Spending the night on a wet sheet added even more motivation - it was time to get serious about building better living quarters and furniture."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('shop_item_constructing') >= 1
    }
},{
    id: 'shop_item_herbs_handbook_2_1',
    title: 'The Mysterious Blue Potion',
    text: [
        "Yesterday, while strolling through the streets, you wandered into a bookstore. Among the dull and monotonous covers, your gaze fell on one book with a bright blue potion painted on the cover. You bought the book without hesitation and brought it home.",
        "You had to struggle through to the middle to find a familiar word. But you found a recipe with an eloquent illustration of ingredients. Getting incredible inspiration, you brewed the mixture until 4 in the morning, and it even turned out the same color as in the picture.",
        "You were already reaching for a spoon to taste it when you remembered that you had no idea what this mixture was supposed to do.",
        "You decided to approach it creatively - you left the mixture on the street, hoping that local raccoons would definitely decide to try it, and then you would see the effect.",
        "The next day, to your surprise, the mixture remained standing on the table, and next to it lay a satisfied purring cat, enjoying the smell of mint.",
        "You realized that it's still worth buying another dictionary to understand at least something. Good thing it's practically free compared to the cost of yesterday's purchase."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('shop_item_herbs_handbook_2') >= 1
    }
},{
    id: 'action_spiritual_alignment_1',
    title: 'The Rebellious Toothbrush',
    text: [
        "After long morning affirmations, you finally dared to make changes - now you would seriously take up the study of magic. Filled with inspiration, you tried to use a spell to make the toothbrush fly into your hand.",
        "After 20 minutes of effort, a miracle happened - the brush flew up into the air from the glass - and... flew out into the street.",
        "You rushed into the yard, trying to bring the situation under control, but without success - the mad toothbrush had finally decided to show its independence and shot straight into the nose of a guard who was passing by. Only after that, breaking in half, it innocently fell to the road.",
        "You spent the day in the guardhouse, so you had time to think about your mistakes and understand where you went wrong - probably, next time it's worth tying the toothbrush to the sink."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_spiritual_alignment') >= 100
    }
},{
    id: 'action_spiritual_alignment_2',
    title: 'The Merchant\'s Dinner',
    text: [
        "Today you were invited to dinner by a local wealthy merchant, whom you accidentally met during a concert of local musicians, when you helped light a lantern with magic and helped him find his wallet that flew out of his pocket.",
        "During dinner, your wealthy acquaintance introduced you as the strongest mage he had ever known, and asked you to demonstrate your magical skills.",
        "You, stepping onto the podium, forgot all the magic you knew before due to nervousness. You loudly hiccuped, and only tried to utter a word when the hall burst into laughter. And then behind your back, an extinguished torch lit up.",
        "The hall stopped laughing. You, having mastered yourself, exclaimed:",
        "\"Tell me, didn't your mood lift? Isn't this magic?\"",
        "The hall applauded and began laughing even harder.",
        "The merchant said the next day that you saved the most boring party, and thanks to you, he got a serious contract to sell textiles to the neighboring province. However, after asking about your reward for your role in the contract, you never saw him again."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_spiritual_alignment') >= 250
    }
},{
    id: 'action_spiritual_alignment_3',
    title: 'The Boomerang Stone Incident',
    text: [
        "Deciding to take a break from constant training, you took your favorite sausages, fruits and came to sit by the lake.",
        "You remembered how you used to love throwing stones into the lake and watching them skip across the water.",
        "Hmm, what if you try to use magic to make the stone return to you like a boomerang.",
        "You threw the stone, having previously enchanted it - and indeed, after skipping across the water, it began to turn around and skip back to you.",
        "You tried throwing harder - and success again.",
        "Finally, you swung and threw the stone with all your might. The stone flew over the lake and hid behind the trees. A scream came from somewhere beyond the lake. Within a few minutes, the guards were escorting you under escort, arresting you for an attempt on the local guard lieutenant.",
        "Your harmony with nature and magic experiments ended with five days of imprisonment. However, you didn't get bored, you almost managed to make a hole in the wall using only magic. So now you know that no walls will stop you."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_spiritual_alignment') >= 500
    }
},{
    id: 'action_spiritual_alignment_4',
    title: 'The Rebellious Saw Incident',
    text: [
        "You have long worked on developing your magical abilities, and finally reached such a level that you learned to perform complex manipulations with objects using only magic.",
        "You decided to try creating another wooden box without touching the tool with your hands. You easily lifted the saw from the table with the power of thought, and began to saw the board with it.",
        "After the board was sawn into two equal parts, you realized that controlling objects for such a long time takes a lot of your strength, so you got tired and decided to 'put' the saw on the table. However, everything went wrong as expected - the saw vibrated and jumped into the air. Hanging there for a few seconds, it made a steep dive and began sawing the legs of your bed.",
        "No matter how you tried to calm the rebellious saw, the table legs went next, and then the shelves.",
        "Finally, when the saw calmed down, you had plenty of wooden materials and no intact furniture."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_spiritual_alignment') >= 1000
    }
},{
    id: 'thinkroot_plantation_1',
    title: 'The Forgotten Plantation',
    text: [
        "You remembered that Thinkroot helps you sleep better, and after that you even remember where you put your reading glasses. So you planted a plantation near your home.",
        "However, the next day, you were still trying to remember where exactly you planted them..."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('thinkroot_plantation') >= 1
    }
},{
    id: 'focusberry_plantation_1',
    title: 'The Sunset Discovery',
    text: [
        "You were sitting on a bench, admiring the sunset and chewing your favorite Focusberry berries. They always helped you concentrate.",
        "Suddenly, you glanced under the old tilted tent and noticed that one of the plants seemed to have sprouted. You realized that you could grow them at home too - just need shade and moisture."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('focusberry_plantation') >= 1
    }
},{
    id: 'core_duckweed_plantation_1',
    title: 'The Wet Boots Epiphany',
    text: [
        "After long hours of collecting Core Duckweed, you once again came home with wet boots. You thought you should buy better boots, but then it dawned on you - there's also a swampy area near you where you can try growing Core Duckweed.",
        "Plus savings on boots!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('core_duckweed_plantation') >= 1
    }
},{
    id: 'berry_plantation_1',
    title: 'The Berry Discovery',
    text: [
        "You always loved picking berries in the forest, but one day you noticed that after picking berries, your mood improved and you gained energy. You thought - why not grow them at home?",
        "Now you always have fresh berries, and you no longer need to walk far into the forest."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('berry_plantation') >= 1
    }
},{
    id: 'fly_mushroom_plantation_1',
    title: 'The Parallel Worlds Discovery',
    text: [
        "After accidentally eating a fly agaric, you discovered within yourself the ability to see parallel worlds. To hell with what the doctor who brought you to your senses says - you discovered your new alter ego - a super-mage who saved the world from an evil demon.",
        "So, in the name of saving the parallel universe, you decided to plant a garden bed near your home."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('fly_mushroom_plantation') >= 1
    }
},{
    id: 'golden_algae_plantation_1',
    title: 'The Night Path Illumination',
    text: [
        "After night trips for rare plants or your favorite kvass home, you regularly stepped into swamps in the dark. You remembered the golden algae that glows in the dark.",
        "So you decided to plant it in the swamp near your home. Now you won't need to walk far for it, and your night path for kvass with bread will become safer!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('golden_algae_plantation') >= 1
    }
},{
    id: 'knowledge_moss_plantation_1',
    title: 'The Slippery Slope Revelation',
    text: [
        "Walking on the cliffs near the settlement, you once again slipped on the moss that covered the stones. While you were flying down, you remembered all the Latin and all the alchemical recipes you knew.",
        "Finally, landing on something soft, you looked around - and realized that it was the same moss you had just cursed that saved you.",
        "Perhaps this is a sign - it's safer to plant moss near home."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('knowledge_moss_plantation') >= 1
    }
},{
    id: 'aloe_vera_plantation_1',
    title: 'The Guardian Angel Plant',
    text: [
        "Yesterday you decided to mow the grass near your home. Deciding to rest a bit, you lay down under a tree and fell asleep. However, the treacherous shadow didn't wait for you to wake up and went against the sun, leaving you to burn.",
        "Waking up, you felt that everything was burning except your left heel, which was 'friendly' touched by aloe vera that accidentally sprouted under the alder.",
        "Without thinking, you looked for root shoots and carefully transplanted them - now you'll have your own guardian angel against burns."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('aloe_vera_plantation') >= 1
    }
},{
    id: 'ginseng_plantation_1',
    title: 'The Longevity Garden',
    text: [
        "You have repeatedly noticed that after drinking ginseng tea, you endured the heat more easily and managed to bypass more tents in search of the most profitable price for your favorite sausages.",
        "So the argument with your neighbor about whether he would outlive you became the last straw - filled with determination, you set about replenishing your own supply of longevity by planting ginseng."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('ginseng_plantation') >= 1
    }
},{
    id: 'nightshade_plantation_1',
    title: 'The Dream Experiment',
    text: [
        "You accidentally ate nightshade and saw strange dreams. You realized that this plant has special properties for magic.",
        "Now you have your own plantation for dream experiments."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('nightshade_plantation') >= 1
    }
},{
    id: 'harmony_blossom_plantation_1',
    title: 'The Market Negotiator',
    text: [
        "After another trip to the market, you got into an argument with a watermelon seller and managed to buy them twice as cheap. Returning home, you realized that the whole thing was in a strange plant that you added to your tea.",
        "Now at the market they call you 'the haggler', but you know how to get an exclusive discount and have found the secret of peace and balance - so you set about growing the miraculous sedative."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('harmony_blossom_plantation') >= 1
    }
},{
    id: 'ember_leaf_plantation_1',
    title: 'The Fence Jumping Incident',
    text: [
        "Yesterday you were at a party and returned home in the early morning. Tired after dancing, barely moving your legs, you suddenly felt that you had wandered into the wrong place. You heard growling and barking dogs, and realized that in the dark you had wandered into the yard of the local elder.",
        "You started running as fast as you could wherever your eyes looked, until they rested on a high fence. And then you felt such burns on your feet that you didn't understand how you jumped over the fence.",
        "The dogs remained behind the fence, and you remembered those burns. Coming home, you put on gloves, cleaned your pants of burrs and thorns, and that same night you set about planting these plants under the fence - let them now burn the neighbor's cows that disturb your peace."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('ember_leaf_plantation') >= 1
    }
},{
    id: 'mystic_bloom_plantation_1',
    title: 'The Stubborn Plant Battle',
    text: [
        "Finding a mysterious purple plant, you tried to plant it near your home for a long time, but no matter how hard you tried - it didn't take root.",
        "However, you didn't give up and tried until the stubborn plant sprouted exactly where you were going to make a path, using a spell that stopped grass growth.",
        "On the tenth day of continuous spells, when you with bags under your eyes and a glassy look were asking for another book of grass-stopping spells, you were still told that you could use a special weed killer.",
        "Tired, but not broken - you still showed the grass where its place was, and now you have both a path and a plantation! Sometimes, science is even better than magic!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('mystic_bloom_plantation') >= 1
    }
},{
    id: 'paper_working_1',
    title: 'The Stone Notes Experiment',
    text: [
        "Yesterday you came to the shop again, hoping to buy your eighth notebook this week. The shopkeeper looked at you with surprise, doubting that you were really using them for their intended purpose.",
        "As it turned out, you had bought out all the stock.",
        "Disappointed, you went home and tried to lay out notes with stones under your house. Satisfied with your ingenuity and the money saved on notebooks, you went to sleep. However, what disappointment awaited you in the morning....",
        "It had rained heavily during the night, so in place of your notes there was a large puddle in which a neighbor's pig was happily splashing around.",
        "Looks like you'll have to take the paper supply situation into your own hands - you decided, and stocked up on a manual for creating your own paper supplies."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('shop_item_paper_working') >= 1
    }
},{
    id: 'structure_hut_1',
    title: 'The Tent Chase Incident',
    text: [
        "You had been telling yourself for too long that sleeping in a tent was the best way to achieve harmony with nature.",
        "However, one night you woke up to a furious wind. Realizing you had forgotten to check if the tent was properly secured, you lit a candle and went outside. As soon as you stuck your nose out the door, the candle went out. Everything was swallowed by darkness, and the tent decided to go its own way, flying off with the wind with a treacherous rustle.",
        "You ran after it with shouts of random curses and spells. Eventually, one of the spells worked, and the tent stopped. However, running closer you realized it had caught on the neighbor's apple tree. You climbed the tree, trying to get the tent tangled in the branches. After half an hour of futile efforts, a frightened neighbor jumped out of the house with a stick in his hands and shouts of: 'Thief! Robber! I'll show you now!' - and rushed straight at you.",
        "Understanding that you had no time to explain anything, you ran for your life.",
        "Reaching the other end of the settlement, realizing you had broken away from the chase, you decided to slowly return.",
        "Already in the morning, when the neighbor had calmed down and could at least recognize you - you laughed long about this situation. But by the next evening you and the neighbor had finished work on your first 'normal' dwelling. From afar it resembles an architectural work of local children, but at least wooden branches are heavier than a tent, so the neighbor's apple tree will be safe."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('structure_hut') >= 1
    }
},{
    id: 'action_public_engagement_1',
    title: 'The First Applause',
    text: [
        "Today you once again gave a passionate motivational speech to the locals in the square. And you wouldn't believe what happened!",
        "For the first time, you weren't pelted with banana peels! And two listeners even applauded!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_public_engagement') >= 100
    }
},{
    id: 'action_public_engagement_2',
    title: 'The Cookie Strategy',
    text: [
        "You have finally discovered a reliable recipe for oratory art and successful public engagement!",
        "At the beginning of your speech, you promised that at the end of your speech, everyone would get free cookies.",
        "However, you didn't calculate that everyone would be so interested in your speech. So you had to visit 3 shops to buy everything needed before you got beaten up.",
        "Despite the fact that after the event everyone discussed exclusively your generosity, you are convinced that it was your oratory art that made such an impression on the audience."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_public_engagement') >= 250
    }
},{
    id: 'action_academic_discussions_1',
    title: 'The White Shirt Breakthrough',
    text: [
        "Today in the city hall, regular philosophical debates were taking place.",
        "This time you wore a white shirt instead of your old torn robe, so you were allowed into the hall for the first time. Although you weren't given the floor to speak, and there wasn't even a seat for you. But at least you didn't have to listen to conversations from behind closed doors.",
        "This is the first success!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_academic_discussions') >= 100
    }
},{
    id: 'action_academic_discussions_2',
    title: 'The Earth Shape Controversy',
    text: [
        "Today you got the opportunity to join a discussion about the shape of the Earth. Most of those present in the hall agreed that it was flat, although some weirdos tried to prove otherwise. Entering into a heated argument with them, you brought up argument after argument, and accidentally proved that it was not flat.",
        "Most of the academics, with shouts of 'Ignoramus!' pushed you out of the hall.",
        "Your pants suffered somewhat, but your dignity - not at all! Now you know for sure that the Earth is cubic, and you even convinced that the edge runs along the same mountain range nearby, from which you flew down when you tried to reach the clearing with beautiful Nightshade."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_academic_discussions') >= 250
    }
},{
    id: 'action_nail_standing_1',
    title: 'The Bear Alarm Incident',
    text: [
        "For a week straight, your neighbors couldn't sleep due to the screams coming from your tent when you tried to stand on nails.",
        "The day before yesterday, guards burst into your tent, thinking that a wandering bear had broken in, which had been seen in the settlement recently."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_nail_standing') >= 100
    }
},{
    id: 'action_nail_standing_2',
    title: 'The Nail Boycott',
    text: [
        "You still turn pale when you walk past construction debris and see some nails, remembering your evening torments. However, persistence takes over.",
        "Although you continue practicing every evening, in everyday life you declared a boycott of nails - now you've learned to cook resin to glue wooden boards together instead of nailing them."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_nail_standing') >= 250
    }
},{
    id: 'action_nail_standing_3',
    title: 'The Stone Path Mastery',
    text: [
        "Your persistence is bearing fruit.",
        "You no longer have a panic fear of cutting your feet on stones, so now you can easily go to the forest for chanterelles by the shortcut.",
        "However, nettles still cause you problems. But you're confident you can handle even that."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_nail_standing') >= 500
    }
},{
    id: 'action_nail_standing_4',
    title: 'The Night Toad and the Nail',
    text: [
        "You woke up in the middle of the night from a nightmare — in your dream, a giant toad attacked you and you had to run.",
        "Still shaken with shame and fear, you jumped out of bed to drink some water, but accidentally stepped on a teacup you had left under the bed.",
        "You felt a crunch and pain in your foot. Nevertheless, the pain subsided rather quickly.",
        "You lit a candle and examined your foot — the shards hadn't pierced your sole, but you noticed a nail sticking out of your foot.",
        "Swearing, you pulled the nail out and realized that taking a sleeping potion before nail standing is not the best idea."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_nail_standing') >= 2000
    }
},{
    id: 'action_deep_focus_1',
    title: 'The Interrupted Meditation',
    text: [
        "Yesterday you decided to try deep focus practices on inner strength and spirit. So you sat on your mat and immersed yourself in a session...",
        "Your session was interrupted by musicians playing the trumpet. You had already started mentally cursing them, but your love for music overcame your love for inner harmony. You went outside, but saw no one.",
        "And then, suddenly, a new sound. And you realized it was the rumbling of your stomach. Seems like it's time to look for practices to calm the stomach without using sausages."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_deep_focus') >= 250
    }
},{
    id: 'action_deep_focus_2',
    title: 'The Sleep Therapy Discovery',
    text: [
        "You agreed with a friend who also studies alchemy to go to a neighboring settlement for Evergreen Fern flowers, which were supposed to enhance the effect of potions. However, you were skeptical about this idea from the very beginning, as you had never seen such a plant in any of the pictures you had looked at in books.",
        "Nevertheless, for the sake of friendship, you agreed to go. The road was long. Accustomed to not wasting time, you engaged in meditation practices and deep focusing along the way. Sitting more comfortably on the hay that was laid under the cart, you immersed yourself in inner harmony.",
        "You woke up from a strong impact. You saw a river in front of you, a broken cart, and your friend snoring next to you with a broken knee and forehead. You tried to wake him up, but to no avail.",
        "You had to carry him back to the settlement in your arms.",
        "After bringing him home, you put him on the bed and were about to go for a doctor when that fool woke up.",
        "As it turned out, he had serious sleep problems that he wanted to solve with the help of potions.",
        "He confessed that your practices had rocked him into such a deep sleep that he hadn't had in 10 years.",
        "With mixed feelings of anger and pride, you went home. However, long before you crossed the threshold of your possessions, you were seized by the idea of making money on practices to combat insomnia."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_deep_focus') >= 500
    }
},{
    id: 'action_yoga_practices_1',
    title: 'The Osteopath Exchange',
    text: [
        "Your sleep was interrupted by a knock at the door.",
        "You opened it and were met by a man. He had no face, was all pale, with bruises under his eyes, and in a trembling voice said: 'Maybe that's enough?'",
        "You, not understanding what he was talking about, invited him for tea.",
        "Somewhat relaxed, the man started talking. As it turned out, this was a new doctor - an osteopath. He complained that he couldn't cope with the influx of patients who had watched your yoga classes through the fence and were trying to repeat them at home, injuring themselves.",
        "Finally, after drinking a bit more calming tea with fly agarics, you found a compromise. You went out the next day to replace the osteopath and dealt with the queue before lunch. In return, when you came home, you were greeted by trimmed grass and a satisfied, rosy-cheeked osteopath who was swinging on a self-made hammock.",
        "+ Hammock, + Good doctor friend, + Satisfied patients. And all thanks to yoga!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_yoga_practices') >= 2000
    }
},{
    id: 'event_self_motivation_art_permanent_bonus_1',
    title: 'The Cherry Juice Stain Revelation',
    text: [
        "During yet another motivational speech, you were struck by an idea - what if people painted their goals and hung their paintings on the walls by their beds?",
        "Without hesitation, you posted an announcement and eagerly awaited the first session.",
        "Not many people came, but they painted with such enthusiasm that you ran out of ink by the 15th minute of training.",
        "After the session ended, you discovered a terrible secret - most of the settlement's residents can neither write nor draw. So most of the 'paintings' were left to you.",
        "However, one of the students' works reminded you of a cherry juice stain that you left on the sheet when you first tried to use magic to make a glass of juice lift itself from the table and fly to you.",
        "You were overwhelmed by memories of how you started. And with the realization that now you can easily drink a mug of ale without spilling more than half of it, you were overcome with pride!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('event_self_motivation_art_permanent_bonus') >= 1
    }
},{
    id: 'event_art_therapy_sessions_permanent_bonus_1',
    title: 'The Strategic Pie Reserves',
    text: [
        "A week ago you slept extremely poorly - you were haunted by the same dream: you went on a hike to the mountains for meditation and forgot to take your beloved liver pies and sausages.",
        "Yesterday you tried to paint a basket full of your favorite food and left it standing on an easel by your bed overnight. Waking up again, you looked at the painting and remembered the strategic reserves of pies under your pillow. After having a snack, you easily plunged into sleep, where you dreamed of an already empty basket and stomach rumbling, and your duel with the dragon, from which you of course emerged victorious.",
        "The next day you firmly decided that you would help people fight their fears through creativity!"
    ],
    completeCondition: () => {
        return gameEntity.getLevel('event_art_therapy_sessions_permanent_bonus') >= 1
    }
},{
    id: 'shop_item_steel_processing_technology_1',
    title: 'The Neighbor\'s Gift',
    text: [
        "Yesterday your neighbor finally kept his promise.",
        "You had been feeding him your signature tea with fly agarics and mint for a month, and his morning headaches finally stopped. He even saw an elf who prophesied health to him. So this morning you were greeted by a cart full of sturdy century-old oak, from which you had long planned to make a reliable crafting table and a bed that would finally not fall apart from every extra portion of pies you consumed.",
        "So you took up the axe... And the axe shattered.",
        "You tried to saw the oak with the power of thought, and after 3 hours of effort you even saw a light smoke and a mark on the bark when your neighbor stopped you, bringing a cup of hawthorn and lemon balm infusion. Looking in the mirror and seeing a red substance resembling a mixture of tomato juice and milk instead of a face, you realized that you would sooner have a stroke than develop woodworking skills using magic and willpower.",
        "Fortunately, going out for some air, you saw your friend, with whom you shared the situation. The comrade laughed for a long time, then went into your yard and unceremoniously sawed the oak with a saw. You stood for a long time, marveling at his magic. However, the man, laughing friendly, gave you his saw, and you spent an hour sawing the entire trunk.",
        "You treated him to herbal ale, and in the evening you flew home, knowing all the possibilities of brilliant gray metal.",
        "Today you bought the last manual on metalworking at the bookstore without hesitation, and by lunchtime you were able to sharpen a nail that you had recently pulled from your neighbor's horse's hoof."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('shop_item_steel_processing_technology') >= 1
    }
},{
    id: 'action_crafting_training_4',
    title: 'The Rebellious Chair',
    text: [
        "Despite your skills in the art of working with materials, you never got around to making a proper comfortable chair for relaxation.",
        "You were inspired after morning meditation and decided to take on the task.",
        "After carefully drawing up a plan and precisely cutting each wooden detail, you began to assemble everything together.",
        "While attaching the last leg, you swung the hammer properly, but accidentally dropped it. The hammer hit your knee, which had just started healing after a recent trip to the mountains.",
        "Crouching in pain, you remembered all the words you know. However, a moment later you forgot about your knee - you accidentally read a spell. The chair, as if bewitched, flew out into the street and rushed at full speed into the reeds near the neighbor's pond.",
        "You tried to catch up with the rebellious chair. The neighbor's cat, who was peacefully sleeping on the bench, got scared of you and ran away. The chair jumped out of the reeds and rushed after the cat, and you - after the chair.",
        "The cat ran up an apple tree. The chair jumped after it and got tangled in the branches.",
        "You ran to the apple tree and muttered a spell to calm the chair. It fell from the apple tree and scattered. In despair that your work had just crumbled before your eyes, you shook the apple tree hard. A second later, apples and a frightened meowing cat rained down on you.",
        "A few minutes later, a frightened old man came out of the neighbor's house. A minute later, the horror on his face turned into a smile - 'Son, God bless you! I was just thinking about how to get those apples, I thought they'd go to waste.'",
        "You quickly helped the neighbor collect the apples, and half an hour later you were chatting cheerfully, sitting in the neighbor's kitchen and drinking apple compote."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_crafting_training') >= 1000
    }
},{
    id: 'action_crafting_training_5',
    title: 'The Capital vs Local Master',
    text: [
        "You were standing in the yard, repairing your table, when an unfamiliar man approached you and started giving unsolicited advice.",
        "As it turned out - he had worked as an emissary in the capital for quite a long time, and moved to the settlement for retirement when illness no longer allowed him to continue working.",
        "However, you're not going to tolerate some upstart - the settlement already has the best craftsman.",
        "You challenged the man to a duel, and began competing to make a better table. Within an hour your opponent finished his work, while you were still looking for the hammer you forgot where you put.",
        "However, after 3 hours, you finished your work. Propping up your table's leg with a rock so it wouldn't be so obvious that it was crooked, you looked at it and realized that rock didn't help much.",
        "Understanding that you needed to save the situation, you muttered a spell - and a decanter of wine and a good plate of bread and cheese appeared on the table.",
        "The audience clapped enthusiastically and began to feast.",
        "After 5 minutes the table couldn't withstand the excitement and fell to its side. However, everyone managed to feast, so the advantage in voting was on your side. Winning the competition, you decided to continue the action, renewing the food and drinks on your opponent's table.",
        "In the evening you happily dragged a brand new and perfectly level table home. Its former craftsman gave it to you in exchange for several meditation lessons and a glass of elixir for knee pain relief."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_crafting_training') >= 2000
    }
},{
    id: 'action_alchemy_training_4',
    title: 'The Rooster\'s Recipe Discovery',
    text: [
        "Yesterday you brewed another batch of brain enhancement potion and left it to cool outside.",
        "Lying down on your bed, you accidentally fell asleep.",
        "In the morning you woke up to crowing right under your ear. Opening your eyes, you saw a bold rooster in front of you. You tried to chase it away, but the rooster was persistent. It jumped on the table, flipped through several pages of your notebook with its foot and pecked at a recipe.",
        "And then you realized there was an error in the potion formula! Overjoyed, you hugged the rooster and quickly ran with corrected notes to fix the mistake.",
        "By evening you had a working remedy for annoying mosquitoes, and your neighbor had a smart rooster with whom you could discuss the weather."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_alchemy_training') >= 1000
    }
},{
    id: 'action_alchemy_training_5',
    title: 'The Merchant\'s Donkey',
    text: [
        "In the evening, a man knocked on your door. He introduced himself as a wealthy merchant passing through.",
        "He complained that he urgently needed to deliver goods by the end of the week, but his donkey had fallen ill. He was advised to seek you out as a talented alchemist who could heal people's bad moods with your magical potion made from sour grapes, so he turned to you to heal his four-legged companion.",
        "You carefully examined the donkey, and understanding that you had no idea what to do with it, you were already thinking of refusing when you noticed a nail sticking out of its leg. You gave the donkey a pain-relieving elixir and removed the nail.",
        "The man thanked you and was about to leave when he realized that the donkey had no desire to go anywhere - it calmly lay down on the grass and stayed there.",
        "The man tried to force it to get up - the donkey took a few steps and fell.",
        "'You poisoned it!' the man cried out in despair.",
        "And then you realized that there was a full glass of pain reliever on the table, and in your hand you were holding an empty mug where your ale had been sloshing around just an hour ago.",
        "You had to explain to the man that this was a side effect of the 'pain reliever.' So you offered the man to stay the night with you, and even as a sign of gratitude for this, you received a clay vase and a good portion of cookies for free."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_alchemy_training') >= 2000
    }
},{
    id: 'action_elemental_channeling_1',
    title: 'The Yawn Disaster',
    text: [
        "You have learned to work with the elements so masterfully that the candle no longer goes out when you yawn while trying to translate a book text.",
        "However, yesterday you yawned so hard that the candle tipped over and fell on the carpet. The carpet caught fire.",
        "You tried to create water to extinguish the flame. And you succeeded!",
        "However, after that such a downpour began on the street that all your fly agaric plantations were hopelessly washed away."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_elemental_channeling') >= 500
    }
},{
    id: 'action_elemental_channeling_2',
    title: 'The Clean City Disaster',
    text: [
        "Today the city sergeant organized a clean city day - each townsman received a broom and a piece of road to sweep.",
        "You, without thinking long, summoned a gust of wind that easily swept all the dust from the road... along with the facing masonry.",
        "By evening, all the townspeople gathered in the park literally next door for mass festivities, but they were disturbed by the sound of a hammer and curses that reached them.",
        "By morning you still restored the coating, and after drinking a calming infusion, you went to sleep."
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_elemental_channeling') >= 1000
    }
}]