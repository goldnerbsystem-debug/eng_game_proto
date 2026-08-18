gsap.registerPlugin(SplitText);

// =========================================================================
// 0. GAME DATA CONTAINER (With Tiers & Weights)
// =========================================================================
const GAME_LEVELS = [

  // ==========================================
  // CHAPTER 1 — THE MESSAGE
  // ==========================================

  // SHORT
  {
    id: 101,
    tier: "short",
    weight: 5,
    prompt: "A strange message appeared on my phone after school. I didn't recognise the number.",
    nouns: ["message", "phone", "school", "number"]
  },

  // MEDIUM
  {
    id: 102,
    tier: "medium",
    weight: 3,
    prompt: "A strange message appeared on my phone after school. I didn't recognise the number. The message contained a picture of the library with a red circle around one of the windows.",
    nouns: ["message", "phone", "school", "number", "picture", "library", "circle", "windows"]
  },

  // LONG
  {
    id: 103,
    tier: "long",
    weight: 1,
    prompt: "A strange message appeared on my phone after school. I didn't recognise the number. The message contained a picture of the library with a red circle around one of the windows. Under the picture was a single word: \"Tonight.\"",
    nouns: ["message", "phone", "school", "number", "picture", "library", "circle", "windows", "picture", "word"]
  },


  // ==========================================
  // CHAPTER 2 — THE LIBRARY
  // ==========================================

  // SHORT
  {
    id: 201,
    tier: "short",
    weight: 5,
    prompt: "I walked towards the library after school. The building was almost empty.",
    nouns: ["library", "school", "building"]
  },

  // MEDIUM
  {
    id: 202,
    tier: "medium",
    weight: 3,
    prompt: "I walked towards the library after school. The building was almost empty. Near the entrance, I noticed a small piece of paper on the floor.",
    nouns: ["library", "school", "building", "entrance", "paper", "floor"]
  },

  // LONG
  {
    id: 203,
    tier: "long",
    weight: 1,
    prompt: "I walked towards the library after school. The building was almost empty. Near the entrance, I noticed a small piece of paper on the floor. On the paper was the same symbol I had seen in the mysterious picture.",
    nouns: ["library", "school", "building", "entrance", "paper", "floor", "symbol", "picture"]
  },


  // ==========================================
  // CHAPTER 3 — THE HIDDEN ROOM
  // ==========================================

  // SHORT
  {
    id: 301,
    tier: "short",
    weight: 5,
    prompt: "I followed the symbol to the back of the library. There was an old door.",
    nouns: ["symbol", "library", "door"]
  },

  // MEDIUM
  {
    id: 302,
    tier: "medium",
    weight: 3,
    prompt: "I followed the symbol to the back of the library. There was an old door. A small key was hidden underneath a loose piece of wood.",
    nouns: ["symbol", "library", "door", "key", "wood"]
  },

  // LONG
  {
    id: 303,
    tier: "long",
    weight: 1,
    prompt: "I followed the symbol to the back of the library. There was an old door. A small key was hidden underneath a loose piece of wood. When I opened the door, I found a room filled with old books and photographs.",
    nouns: ["symbol", "library", "door", "key", "wood", "room", "books", "photographs"]
  },


  // ==========================================
  // CHAPTER 4 — THE CLUE
  // ==========================================

  // SHORT
  {
    id: 401,
    tier: "short",
    weight: 5,
    prompt: "Inside the room, I found a photograph on a table. Someone had written a name on the back.",
    nouns: ["room", "photograph", "table", "name"]
  },

  // MEDIUM
  {
    id: 402,
    tier: "medium",
    weight: 3,
    prompt: "Inside the room, I found a photograph on a table. Someone had written a name on the back. The name belonged to someone who had disappeared from the school years ago.",
    nouns: ["room", "photograph", "table", "name", "school"]
  },

  // LONG
  {
    id: 403,
    tier: "long",
    weight: 1,
    prompt: "Inside the room, I found a photograph on a table. Someone had written a name on the back. The name belonged to someone who had disappeared from the school years ago. Behind the photograph was a final message explaining where the mystery had begun.",
    nouns: ["room", "photograph", "table", "name", "school", "photograph", "message", "mystery"]
  }

];

const starterBtn = document.querySelector(".startbutton");
const startScreen = document.querySelector(".starter");

// =========================================================================
// 1. GAME STATE TRACKERS
// =========================================================================
let activeLevelData = null; // Stores the active level object currently being played
let nounCount = [];         // Tracks correct word spans clicked in the current round
let wrongClicksCount = 0;   // Tracks mistakes in the current round
let totalCorrectFound = 0;  // Cumulative correct answers across all rounds
let totalWrongClicks = 0;   // Cumulative wrong clicks across all rounds
let roundsCompleted = 0;    // Number of rounds played so far
const MAX_ROUNDS = 6;       // Total number of rounds before game completes

// Trackers for Testing Regime 2 (Prompt Comprehension & Tier Analytics)
let roundStartTime = 0;     // Timestamp (ms) when prompt is displayed
let roundsHistory = [];     // Array storing detailed metrics per round

let nounEr = [];            // Active array of target noun strings for current level
let mySplit = null;         // GSAP SplitText instance

// =========================================================================
// 2. DOM TARGETS
// =========================================================================
// Layer 1: Gameplay Screen
const initialLevel = document.querySelector(".level:not(.over)");
const textContainer = initialLevel.querySelector(".tbox");
const feedbackBox = initialLevel.querySelector(".feedbox");
const header2 = initialLevel.querySelectorAll("h2");
const textPContainer = initialLevel.querySelector(".tbox p");
const nounCountInput = initialLevel.querySelector(".numInput");

// Layer 2: Success Screen
const successLayer = document.querySelector(".level.over");
const successTbox = successLayer.querySelector(".tbox");
const successFeedbox = successLayer.querySelector(".feedbox");
const successNumInput = successLayer.querySelector(".numInput");
const scoreFinal = successLayer.querySelector(".score");

// =========================================================================
// 3. ANIMATION TIMELINES (GSAP)
// =========================================================================
const tabletAnim = gsap.timeline({ paused: true });
tabletAnim
  .fromTo(textContainer, { opacity: 0 }, { duration: 0.2, opacity: 1 })
  .to([textContainer, feedbackBox], { duration: 0.3, scaleX: 1.05, ease: "power2.out" })
  .to([textContainer, feedbackBox], { duration: 0.3, scaleX: 1, ease: "power2.out" })
  .to(header2, { duration: 0.2, scaleY: 1.1, ease: "power2.out" })
  .to(header2, { duration: 0.2, scaleY: 1, ease: "power2.out" });

gsap.set(successLayer, { opacity: 0, visibility: "hidden", pointerEvents: "none" });

const successAnim = gsap.timeline({ paused: true });
successAnim
  .to(initialLevel, { duration: 0.3, opacity: 0, scale: 0.95, ease: "power2.in" })
  .set(initialLevel, { display: "none" })
  .set(successLayer, { visibility: "visible", pointerEvents: "all" })
  .to(successLayer, { duration: 0.3, opacity: 1 })
  .fromTo(successTbox, { opacity: 0, y: 10 }, { duration: 0.4, opacity: 1, y: 0 })
  .fromTo(successFeedbox, { opacity: 0 }, { duration: 0.3, opacity: 1 }, "-=0.2");

// =========================================================================
// 4. WEIGHTED RANDOMIZER HELPER FUNCTIONS
// =========================================================================

// Adjusts the weights of prompts in GAME_LEVELS based on performance in the finished round
function adjustWeights(levelAccuracy) {
  GAME_LEVELS.forEach((level) => {
    if (levelAccuracy >= 0.8) {
      // High accuracy (80%+): Boost chance of picking medium/long prompts next
      if (level.tier === "long") level.weight += 2;
      if (level.tier === "medium") level.weight += 1;
    } else {
      // Low accuracy (<80%): Boost chance of picking short prompts next
      if (level.tier === "short") level.weight += 3;
      if (level.tier === "long" && level.weight > 1) level.weight -= 1;
    }
  });
}

// Selects a random level object from GAME_LEVELS using cumulative weight probabilities
function selectNextWeightedLevel() {
  const totalWeight = GAME_LEVELS.reduce((sum, lvl) => sum + lvl.weight, 0);
  let random = Math.random() * totalWeight;

  for (let level of GAME_LEVELS) {
    if (random < level.weight) {
      return level;
    }
    random -= level.weight;
  }
  return GAME_LEVELS[0]; // Fallback
}

// =========================================================================
// 5. CORE GAMEPLAY FUNCTIONS
// =========================================================================

function initlevel() {
  starterBtn.addEventListener("click", () => {
    initialLevel.classList.remove("locked");
    startScreen.classList.add("locked");
    tabletAnim.play(0);
    beginLevels();
  });
}

function beginLevels(levelData) {
  // 1. Revert previous SplitText instance if it exists
  if (mySplit) {
    mySplit.revert();
  }

  // 2. Use passed-in level object OR pick one via weighted randomizer on start
  activeLevelData = levelData || selectNextWeightedLevel();

  // 3. Start timer for Regime 2 completion time tracking
  roundStartTime = Date.now();

  // 4. Populate prompt text and set answer key
  textPContainer.textContent = activeLevelData.prompt;
  nounEr = activeLevelData.nouns;

  // 5. Wrap words using SplitText
  mySplit = new SplitText(textPContainer, { type: "words" });

  // 6. Attach click listeners to every word
  mySplit.words.forEach((wordSpan) => {
    wordSpan.addEventListener("click", () => {
      // Clean word: lowercase and remove trailing punctuation
      const clickedWord = wordSpan.textContent
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

      if (nounEr.includes(clickedWord)) {
        // --- CORRECT NOUN ---
        wordSpan.classList.add("found");

        if (!nounCount.includes(wordSpan)) {
          nounCount.push(wordSpan);
          totalCorrectFound++;
        }

        gsap.fromTo(wordSpan, { scale: 1.2 }, { duration: 0.3, scale: 1, ease: "power2.out" });
        levelComplete();

      } else {
        // --- WRONG WORD ---
        wrongClicksCount++;
        totalWrongClicks++;

        gsap.to(wordSpan, {
          scale: 0.8,
          duration: 0.2,
          repeat: 3,
          yoyo: true,
          ease: "power4.inOut"
        });
      }
    });
  });

  updateScoreUI();
}

// Helper to store payload in browser localStorage
function saveLocally(gameData) {
  try {
    localStorage.setItem("englishGameSession", JSON.stringify(gameData));
    console.log("Game progress saved to localStorage successfully.");
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

function levelComplete() {
  const found = nounCount.length;
  const total = nounEr.length;

  if (found === total && total > 0) {
    nounCountInput.textContent = `All Nouns Found!`;

    roundsCompleted++;

    // Calculate individual round metrics for Testing Regime 2
    const roundEndTime = Date.now();
    const durationSeconds = parseFloat(((roundEndTime - roundStartTime) / 1000).toFixed(1));
    const roundAttempts = nounCount.length + wrongClicksCount;
    const roundAccuracyPercent = Math.round((nounCount.length / roundAttempts) * 100) || 0;

    // Record detailed round data
    roundsHistory.push({
      roundNumber: roundsCompleted,
      levelId: activeLevelData.id,
      promptTier: activeLevelData.tier,      // "short", "medium", or "long"
      promptText: activeLevelData.prompt,
      timeTakenSeconds: durationSeconds,
      mistakes: wrongClicksCount,
      accuracy: roundAccuracyPercent
    });

    // Check if the overall game session is complete
    if (roundsCompleted >= MAX_ROUNDS) {
      
      // --- END OF GAME ---
      const totalAttempts = totalCorrectFound + totalWrongClicks;
      const finalAccuracy = Math.round((totalCorrectFound / totalAttempts) * 100) || 0;

      const sessionPayload = {
        timestamp: new Date().toISOString(),
        totalCorrect: totalCorrectFound,
        totalMistakes: totalWrongClicks,
        overallAccuracy: finalAccuracy,
        roundsPlayed: roundsCompleted,
        roundsHistory: roundsHistory // Contains detailed per-tier data for Firestore
      };

      // 1. Save locally
      saveLocally(sessionPayload);

      // 2. Save to Firestore database
      if (typeof window.saveToFirestore === "function") {
        window.saveToFirestore(sessionPayload);
      }

      if (successNumInput) {
        successNumInput.textContent = "Congratulations! All Levels Complete.";
      }
      if (scoreFinal) {
        scoreFinal.innerHTML = `Accuracy: ${finalAccuracy}% (${totalCorrectFound} Correct / ${totalWrongClicks} Mistakes)`;
      }

      successAnim.play();

    } else {
      
      // --- BETWEEN ROUNDS ---
      // Calculate accuracy ratio for weight adjustment
      const roundAccuracy = nounCount.length / roundAttempts;

      // Adjust weights based on performance
      adjustWeights(roundAccuracy);

      // Select next level
      const nextLevel = selectNextWeightedLevel();

      // Reset round trackers
      nounCount = [];
      wrongClicksCount = 0;

      // Load next level after brief delay
      gsap.delayedCall(0.8, () => {
        beginLevels(nextLevel);
        tabletAnim.play(0);
      });
    }
  } else {
    updateScoreUI();
  }
}

function updateScoreUI() {
  if (nounCountInput && nounEr) {
    nounCountInput.textContent = `Nouns Found: ${nounCount.length} of ${nounEr.length}`;
  }
}

// =========================================================================
// 6. INITIALIZATION
// =========================================================================
window.addEventListener("load", () => {
  initlevel();
});