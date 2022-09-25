let jkey = [false, false, false, false,]
let jx = 106;
let jy = 21;
let jspeed = 4; //jacks speed
let bi = 0;
let interacting = false;
let caninteract = true;
let jframe = 0; //frame jack is on
let decision = false;
let eatingpill = false;
let eatpill = false;
let interactspots = [-200, -967];
let textintfart = [['kill yourself bitch','haha just kidding','lol imagine','skull emoji','Maybe this will have an affect on the lore in THANOS 2? Like the challenge is to escape before the water floods the entire city? Or an invasion will happen on the "THANOS plane" for lack of a better word and Hammer could smash Putin in the face. Idk what do you guys think?'],['pill anyone?','(use arrow keys to choose)','im cute']]
let textinterectiantingon = 0;
let biwhenstarted = 0;
let song;

function setup() {
  frameRate(60);
  createCanvas(400, 400);
  let directory = "games/jackquest/"
  song = loadSound(directory+'song.ogg');
  deathsong = loadSound(directory+'jackcry.ogg');
  jacks = loadImage(directory+'jack.png');
  mapp = loadImage(directory+'map.png');
  witch = loadImage(directory+'pill.png');
  witchless = loadImage(directory+'pilless.png');
  awesome = loadImage(directory+'awesome.gif');
}

function draw() {
  bi += 1;
  noSmooth();
  background(0);
  push()
  translate(jx,jy)
  image(mapp, 0,0);
  if (!eatingpill) {
    image(witch,1000,0)
  } else {
    image(witchless,1000,0)
  }
  
  caninteract = false;
  for (var i = 0  ;  i < interactspots.length  ;  i++) {
    if (jx < interactspots[i]+40 && jx > interactspots[i]-40) {
      if (!interacting) { //check if interacting, show interact prompt
        textAlign(CENTER);
        colorMode(HSB, 100);
        fill(bi%100,100,100)
        stroke(0);
        strokeWeight(4);
        textSize(15+5*cos(bi/10));
        text('press z to interact', 0-interactspots[i]+200, 100+5*sin(bi/5))
        caninteract = true;
      } else {
        caninteract = true;
        push()
          translate(-jx,-jy+50)
          rect(50,250,300,80)
          fill(0);
          textSize(20);
          textWrap(CHAR);
        if (textinterectiantingon < textintfart[i].length) {
          if (textintfart[i][textinterectiantingon] == 'im cute') {
              if (decision == false) {
                let stringobingo = ' take pill   >dont';
                text(stringobingo.substring(0, int((bi-biwhenstarted)/2)),55,255,290,90)
                eatpill = false;
              } else {
                let stringobingo = '>take pill    dont';
                text(stringobingo.substring(0, int((bi-biwhenstarted)/2)),55,255,290,90)
                eatpill = true;
              }
            
          } else {
          text(textintfart[i][textinterectiantingon].substring(0, int((bi-biwhenstarted)/2)),55,255,290,90)
          }
        } else {
          if (eatpill) {
            jframe = 5+int((bi - biwhenstarted)/5)
            eatingpill = true;
            if (jframe > 28) {
              eatpill = false;
              song.stop();
              deathsong.setVolume(0.0);
              deathsong.loop();
              biwhenstarted = bi;
              jframe = 28;
            }
          } else if (eatingpill) {
            deathsong.setVolume(1.0,15);
            if (((bi-biwhenstarted)/10)-50 < 255) {
              tint(255,255,255,int((bi-biwhenstarted)/10)-50);
            }
            image(awesome,0,0,400,400);
            colorMode(RGB, 100);
            fill(255,255,255)
            stroke(0);
            strokeWeight(4);
            textSize(23);
            textWrap(WORD);
            let jacksstring = '"Write a long story about a boy called Jack who gets kidnapped by witches and forced to take a pill which will extremely painfully and extremely slowly transform him into a monkey, depicting his transforming, ears, eyes, mouth, face, teeth, torso, new tail, arms, hands and legs in vile, horrible, gruesome, and gory detail, with his feet being the most disgusting, gory, painful and detailed part, and he loses the ability to talk."'
            text(jacksstring.substring(0, int((bi-biwhenstarted)/4)),0,0,400,400);
          } else {
            interacting = false;
          }
        }
        pop()
      }
    } else {

    }

  }
  pop()
  if (!interacting) {
    if(jkey[0] && red(get(160+jspeed,260)) > 5) {
      jx += jspeed;
    }
    if(jkey[1] && red(get(241-jspeed,260)) > 5 && jx > -990) {
      jx -= jspeed;
    }
    if(jkey[2] && red(get(200,260-jspeed)) > 5) {
      jy += jspeed;
    }
    if(jkey[3] && red(get(200,260+jspeed)) > 5) {
      jy -= jspeed;
    }
    
    if (jkey[0] || jkey[1] || jkey[2] || jkey[3]) {
      jframe = 1 + int((bi)/3)%4;
    } else {
      jframe = 0;
    }
  }
  //print(jx + " " + jy)
  //background(0);
  //image(mapp, jx,jy);
  push();
  translate(200,200);
  
  img = jacks.get(jframe*125,0,125,153)
  
  image(img, 0-img.width/2, 0-img.height/2);
  pop();
}

function keyPressed() {

  if (!song.isPlaying() && !eatingpill) {
    song.loop();
  }

  if (keyCode === LEFT_ARROW) {
    jkey[0] = true; 
    if (interacting) {
      decision = !decision;
    }
  } else if (keyCode === RIGHT_ARROW) {
    jkey[1] = true; 
    if (interacting) {
      decision = !decision;
    }
  }
  
  if (keyCode === UP_ARROW) {
    jkey[2] = true; 
  } else if (keyCode === DOWN_ARROW) {
    jkey[3] = true; 
  }
  
  if (key == 'z') {
    if (caninteract) {
      if (!interacting) { //if not already interacting with smthg
        interacting = true;
        textinterectiantingon = 0;
        biwhenstarted = bi;
      } else { //progress the dialouge
        if (!eatingpill) { //if we are not eating the pill
          decision = false;
          textinterectiantingon += 1;
          biwhenstarted = bi;
        }
      }
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW) {
    jkey[0] = false; 
  } else if (keyCode === RIGHT_ARROW) {
    jkey[1] = false; 
  }
  
  if (keyCode === UP_ARROW) {
    jkey[2] = false; 
  } else if (keyCode === DOWN_ARROW) {
    jkey[3] = false; 
  }
}