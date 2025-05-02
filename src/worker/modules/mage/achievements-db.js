import {gameCore, gameEntity, gameResources} from "game-framework";
import {unlocksApi} from "game-framework/src/general/unlocks-api";

export const achievementsDb = [{
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
        console.log('ChckIsDemoPassed: ', gameCore.demoVersion);
        const shopUpgrades = gameEntity.listEntitiesByTags(['shop']);
        const incompleteUpgrades = shopUpgrades.filter(one => !one.isUnlocked || (gameEntity.getEntityMaxLevel(one.id) && !one.isCapped));
        console.log('incompleteUpgrades: ', incompleteUpgrades.length);
        if(incompleteUpgrades.length) return false;
        // Check unlocks
        const data = unlocksApi.getGeneralUnlocksStats();
        console.log('incompleteUnlocks: ', data, data.total > data.totalCompleted);
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
        console.log('CHECK: ', gameEntity.getLevel('action_walk'));
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
    id: 'action_gossip_1',
    title: 'The Dragon and the Drifters',
    text: [
        "You found companionship in three local drifters who love sharing tales of their clearly fictional heroics.",
        "One of them was especially convincing when he claimed to have seen a dragon in the forest—and even wounded it with a slingshot.",
        "One day, you ventured into the woods to investigate, but found only pine trees... and some very strange mushrooms. Looking at them, you suspect you’ve uncovered the true source of the hunter’s 'success.'"
    ],
    completeCondition: () => gameEntity.getLevel('action_gossip') >= 10
},{
    id: 'resource_coins_1',
    title: 'The First Clink',
    text: [
        "Your battle against the growling void in your stomach continues heroically.",
        "The few coins rattling in your pouch still aren’t enough to buy a loaf of bread.",
        "But somehow, you’re starting to look at that pouch with hope."
    ],
    completeCondition: () => gameResources.getResource('coins').amount >= 10
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
    id: 'shop_tent_1',
    title: 'A Place to Call Slightly Yours',
    text: [
        "No more fighting local drifters for a spot on the park bench.",
        "With a sense of dignity, you grab your freshly purchased, neatly folded tent and head to the clearing just outside the settlement.",
        "The ground is still damp and cold, but you wisely laid down some pine needles beneath the canvas. Tonight, you fall asleep with a smile—and a hint of self-respect."
    ],
    completeCondition: () => gameEntity.getLevel('shop_item_tent') >= 1
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
    title: 'Spleen Supremacy',
    text: [
        "You've read enough anatomy to confidently identify organs most people don't even know exist.",
        "You now quietly judge anyone who can't point to their spleen.",
        "Not out loud, of course. You're educated, not rude."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_anatomy') >= 500
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
    id: 'action_learn_languages_3',
    title: 'Eloquent and Evicted',
    text: [
        "You finally gathered the courage to order a pint of ale in Old Elvish at the local tavern.",
        "They stared at you like a complete idiot, then brought you a glass of water and asked you to leave.",
        "But who are they to judge? Uneducated peasants! You owe them no explanations."
    ],
    completeCondition: () => gameEntity.getLevel('action_learn_languages') >= 100
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
    id: 'action_yoga_practice_1',
    title: 'Breathless Enlightenment',
    text: [
        "Just yesterday, you read about yoga—and one evening was enough to discover a typo in the guide.",
        "Turns out you were supposed to hold your breath for five **seconds**, not **minutes**.",
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
    id: 'action_meditate_1',
    title: 'The Magic Meditated Back',
    text: [
        "You've firmly decided to pursue magical practices.",
        "Though after today's vision during meditation, you're starting to suspect the magic is the one practicing on *you*.",
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
    id: 'action_meditate_3',
    title: 'Hot Thoughts, Fast Reactions',
    text: [
        "Your magical focus and inner power are growing so rapidly that your body can't quite keep up.",
        "During your latest meditation session, you accidentally sat on a magical rune.",
        "You shot out of your tent like a flaming demon splashed with holy water. Luckily, you had recently moved your camp closer to the river—otherwise, you'd have had exactly one second to invent a spell for summoning a well."
    ],
    completeCondition: () => gameEntity.getLevel('action_meditate') >= 100
},{
    id: 'action_home_errands_1',
    title: 'The Relic of Cleaning',
    text: [
        "While carefully tidying the area around your tents, you discovered a strange wooden object with a shiny golden tip.",
        "Overjoyed, you rushed to the local expert on magical relics and ancient artifacts.",
        "The man gave the item—and you—a puzzled look, then asked why you'd brought him the leg of an old chair.",
        "You left his hut, deeply disappointed. He didn’t even *look* properly. As always, you'll just have to figure it out yourself."
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
    id: 'action_home_errands_3',
    title: 'Order… or Something Like It',
    text: [
        "After hours of relentless cleaning, your territory now resembles something slightly neater than a full-blown garbage heap.",
        "Sadly, aside from the legendary chair leg, no valuable artifacts were found. But at least you finally remembered where you hid your wooden table to keep it dry, and finding a specific book no longer causes a panic attack.",
        "You are, however, now on your fourth pair of replacement glasses. The previous ones remain missing in action."
    ],
    completeCondition: () => gameEntity.getLevel('action_home_errands') >= 100
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
        "The day has come! You convinced the old archmage in the shop that you’re finally knowledgeable enough to try magic without burning down the village.",
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
        "It may only be a modest patch of dirt, but it’s *your* patch of dirt.",
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
    id: 'action_walking_4',
    title: '',
    text: [
        ''
    ],
    completeCondition: () => {
        return gameEntity.getLevel('action_walking') >= 1000
    }
}]