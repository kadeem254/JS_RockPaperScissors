import anime from "animejs";
import _ from "lodash";

import paper from "./images/paper.png";
import rock from "./images/rock.png";
import scissors from "./images/scissors.png";

const STATES = ["INACTIVE", "ACTIVE"];
const HANDS = ["rock", "paper", "scissors"];
const PLAYERS = {}
const COLORS = {
  black: "#000000",
  rich_black_fogra_39: "#0d0d0d",
  eerie_black: "#1a1a1a",
  raisin_black: "#272727",
  jet: "#343434",
  onyx: "#414141",
  davys_grey: "#4e4e4e",

  cultured: "#eff1f3",
  english_vermillion: "#d64550",
  emerald: "#4dc679",
  orange_yellow_crayola: "#fed766",
}
const GAME = {
  state: STATES[0],
  canShoot: false,
  round: 0,
  scores: {
    player_1: 0,
    player_2: 0,
    ties: 0
  }
};

/*****************
  PAGE FUNCTIONS
*****************/

function startGame() {
  // set game state to active
  GAME.state = STATES[1];

  resetGame();

  // allow the player to play a hand
  GAME.canShoot = true;

  // close title screen
  toggleTitleScreen(0);

  return;
}

function displayScores( ){
  let p1_score = document.querySelector("#gameScreen .scoreboard .score-stats .player_1-stat .count");
  let p2_score = document.querySelector("#gameScreen .scoreboard .score-stats .player_2-stat .count");
  let ties_score = document.querySelector("#gameScreen .scoreboard .score-stats .ties-stat .count");

  p1_score.textContent = GAME.scores.player_1;
  p2_score.textContent = GAME.scores.player_2;
  ties_score.textContent = GAME.scores.ties;

  return;
}

function displayRoundNumber(){
  let round_counter = document.querySelector("#gameScreen #current-round");
  round_counter.textContent = GAME.round;
  return;
}

function updateRoundCount(){
  GAME.round++;

  displayRoundNumber();
  return;
}

function updateScore( outcome ){
  return new Promise(
    function( res, rej ){

      switch(outcome){
        case 0:
          GAME.scores.ties++;
          break;
        case 1:
          GAME.scores.player_1++;
          break;
        case 2:
          GAME.scores.player_2++;
          break;
        // if no valid outcome exits fail promise
        default:
          rej("invalid outcome")
      }

      displayScores( );
      updateRoundCount();
      res("score updated");
    }
  )
}

function endGame() {
  // set game state to inactive
  GAME.state = STATES[0];

  // close title screen
  toggleTitleScreen(1);

  // console.log("game ended");
  return;
}

function resetGame() {
  // reset rounds scores and clear the current had signs
  GAME.round = 0;
  GAME.scores.player_1 = 0;
  GAME.scores.player_2 = 0;
  GAME.scores.ties = 0;

  displayScores();
  displayRoundNumber();

  let hands = {
    player_1: document.querySelector("#gameScreen .display .player_1 .hand"),
    player_2: document.querySelector("#gameScreen .display .player_2 .hand"),
  }
  // clear existing content
  Object.entries(hands).forEach(
    ( [key,value] ) => {
      clearChildrenElements( value );
      return;
    }
  )

  return;
}

/**Toggle the tittle screen, valid argument are NULL- to toggle, 0 - to hide the title screen
 * and 1 - to make the tittle screen
 */
function toggleTitleScreen(state = null) {
  // get title screen node
  let titleScreen = document.querySelector("#titleScreen");

  // check that it is a valid node

  // change class of title based on state passed
  switch (state) {
    case 0:
      titleScreen.classList.add("hidden");
      break;
    case 1:
      titleScreen.classList.remove("hidden");
      break;
    default:
      titleScreen.classList.toggle("hidden");
  }

  return;
}

/**Only start game if the game is not active */
function startButtonClickHandler() {
  if (GAME.state === STATES[0]) {
    startGame();
  }
  return;
}

/**Only start game if the game is not active */
function quitButtonClickHandler() {
  if (GAME.state === STATES[1]) {
    endGame();
  }
  return;
}

/**Handles the player's selection of a hand sign to play */
async function handChosen(ev) {
  // check if game is active and if player can make a choice
  // if not dont process further.
  if (GAME.state !== STATES[1] || GAME.canShoot === false) return false;

  // disallow further choice by the player
  GAME.canShoot = false;

  // set the hand choice selected by the player and computer
  let choices = {
    player: ev.target.value,
    computer: computerHandSelected(),
  };

  // play hand shoot animation
  await shootHandSigns( choices.player, choices.computer );
  let outcome = await selectWinner( choices.player, choices.computer );
  await declareWinner( outcome );
  await updateScore( outcome );

  // allow further choice by the player
  GAME.canShoot = true;

  // console.log(choices);
  // console.log( ev.target.value );
  return;
}

/**Returns a promise when the hand shoot is complete */
function shootHandSigns( player_1, player_2) {
  // temporarily just waits for a timeout
  return new Promise((res, rej) => {

    // set the visuals for the player hands
    loadHandsImages( player_1, player_2 ).then(
      () => {
        return res("shoot animation complete");
      }
    );
  });
}

/**Chooses a random hand for the computer */
function computerHandSelected() {
  let hand = _.random(0, HANDS.length - 1);
  return HANDS[hand];
}

function declareWinner( outcome ){
  return new Promise(
    function( res, rej ){
      let animation = {
        duration: 200,
        loop: 4,
        direction: "alternate",
        easing: "easeInOutSine"
      }
      switch( outcome ){
        case 0:
          animation = Object.assign(
            {
              targets: [ "#gameScreen .display .player" ],
              background: [COLORS.rich_black_fogra_39, COLORS.orange_yellow_crayola],
            },
            animation
          );
          break;
        case 1:
          animation = Object.assign(
            {
              targets: [ "#gameScreen .display .player_1" ],
              background: COLORS.emerald,
            },
            animation
          );
          break;
        case 2:
          animation = Object.assign(
            {
              targets: [ "#gameScreen .display .player_2" ],
              background: COLORS.emerald,
            },
            animation
          );
          break;
        default:
          return rej("Outcome passed is invalid");
      }

      let anim = anime(animation);
      anim.finished.then(
        () => {
          return res("outcome animated successfully")
        },
        () => {
          return rej("failed to animate outcome")
        }
      )
    }
  )
}

function createImageElement( url ){
  let image = new Image();
  image.src = url;
  return image;
}

function selectHandImage( handName ){
  switch( handName ){
    case "rock":
      return rock;
    case "paper":
      return paper;
    case "scissors":
      return scissors;
    default:
      return false;
  }
}

/**Returns a promise that selects the winner of a round */
function selectWinner(player1, player2) {
  return new Promise(function (res, rej) {
    // return the value of the winner
    // 0 - tie, 1 - player 1, 2 - player 2
    // console.log(`player 1 = '${player1}', player 2 = '${player2}',`)
    if (player1 == player2) {
      return res(0);
    }

    switch (player1) {
      case "rock":
        if (player2 == "paper") {
          return res(2);
        }
        if (player2 == "scissors") {
          return res(1);
        }
        break;
      case "paper":
        if (player2 == "rock") {
          return res(1);
        }
        if (player2 == "scissors") {
          return res(2);
        }
        break;
      case "scissors":
        if (player2 == "rock") {
          return res(2);
        }
        if (player2 == "paper") {
          return res(1);
        }
        break;
    }

    // if execution reaches this point an error has occured
    console.log("problem encountered");
    return rej("failed");
  });
}

function clearChildrenElements( node ){
  while( node.firstChild ){
    node.removeChild( node.lastChild );
  }
  return;
}

/**When players choose the hands set the images for each player */
function loadHandsImages( player1, player2){
  let hands = {
    player_1: document.querySelector("#gameScreen .display .player_1 .hand"),
    player_2: document.querySelector("#gameScreen .display .player_2 .hand"),
  }
  // clear existing content
  Object.entries(hands).forEach(
    ( [key,value] ) => {
      clearChildrenElements( value );
      return;
    }
  )

  hands.player_1.appendChild( createImageElement( selectHandImage(player1) ) );
  hands.player_2.appendChild( createImageElement( selectHandImage(player2) ) );

  let pop_in = anime({
    targets: [ hands.player_1.querySelector("img"), hands.player_2.querySelector("img") ],
    scale: [
      { value: "0%" },
      { value: "100%" },
    ],
    duration: 500
  })

  return pop_in.finished;
}

/**Loads images in the background once the page finishes loading */
function loadImages(){
  let images = [ rock, paper, scissors ];

  images.forEach(
    (image)=>{
      let _image = new Image();
      _image.src = image;
      return;
    }
  )
}

/***************
  ON PAGE LOAD
***************/

function executeOnPageLoad() {
  loadImages();
  // set start button click handler
  let startButton = document.querySelector("#gameStartButton");
  startButton.addEventListener("click", startButtonClickHandler);

  // set quit button click handler
  let quitButton = document.querySelector("#quitGameButton");
  quitButton.addEventListener("click", quitButtonClickHandler);

  // setup game buttons
  let hands = document.querySelectorAll("#gameScreen .controls .hand");
  hands.forEach((hand) => {
    hand.addEventListener("click", handChosen);
    return;
  });

  let entry = document.querySelector("#gameScreen .display .player_1 .hand");
  entry.appendChild( createImageElement(scissors) );

  // console.log("page loaded");
  return;
}

window.addEventListener("load", executeOnPageLoad);
