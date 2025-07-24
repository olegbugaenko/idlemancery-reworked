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
}]