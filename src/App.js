import logo from './logo.svg';
import './App.css';
// import nodejs bindings to native tensorflow,

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import * as canvas from 'canvas';

import * as faceapi from 'face-api.js';
import React from 'react';
import Navbar from './components/Navbar';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement




class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      didStart: false,
      exit: false,
      meetLength: 10, // 900 seconds => 15mins,
      countDown: 0,
      currentQuestion: 0,
      questions: [
        {
          question: 'Tell us about you',
          duration: 5 //120
        },
        {
          question: 'What are your biggest strenghts?',
          duration: 6//120
        },
        /*{
          question: 'Where do you see yourself in 5 years , and your objectives',
          duration: 10//180
        },
        {
          question: 'Out of the candidates, why should we hire you ?',
          duration: 10//60
        },
        {
          question: 'Why do you want this job?',
          duration: 15//120
        },
        {
          question: 'Tell us about time you disagreed with a decision. What did you do?',
          duration: 12//180
        },
        {
          question: 'Tell us how you think other people would describe you?',
          duration: 10//120
        },*/

      ],

      endOfInterview: false,
      savedFaceStates: [],

      result : [
        {expression: "neutral", result: 0},
        {expression: "surprised", result: 0},
        {expression: "happy", result: 0},
        {expression: "angry", result: 0},
        {expression: "disgusted", result: 0},
        {expression: "sad", result: 0},
        {expression: "fearful", result: 0}
      ]



    }

    this.startTheInterveiw = this.startTheInterveiw.bind(this);
  }


  startTheInterveiw() {
    this.setState({
      didStart: true
    })

    const countDown = setInterval(() => {
      this.getCurrentExpression();

      this.setState({
        countDown: (this.state.countDown + 1)
      })

     
        if ( this.state.countDown === this.state.meetLength) {
          // end of of interview
          this.setState({ endOfInterview: true })

          clearInterval(countDown);

          this.calculateResult()

        } else {
          
        }
      
    }, 1000);
  }



  calculateResult(){

    let resultmage = this.state.result;

    for (let i = 0; i < resultmage.length; i++) {
      const expression = resultmage[i];


      for (let j = 0; j < this.state.savedFaceStates.length; j++) {
        const savedExpression = this.state.savedFaceStates[j];

        if (expression.expression === savedExpression[0].expression) {
          expression.result = expression.result +1;
        }
        
      }
      
    }

    this.setState({
      result:resultmage
    })

  }


  getCurrentExpression() {
    var video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
      //video.src = window.URL.createObjectURL(stream);
       


      faceapi.loadSsdMobilenetv1Model('./weights/ssd_mobilenetv1_model-weights_manifest.json').then((res) => {
        faceapi.loadFaceExpressionModel('./weights/face_expression_model-weights_manifest.json').then((res) => {
          faceapi.detectSingleFace(video).withFaceExpressions().then((r) =>{

            if (r != null) {
              let tmp = this.state.savedFaceStates;
            tmp.push(r.expressions.asSortedArray());
            this.setState({  savedFaceStates: tmp  })
  
            console.log(this.state.savedFaceStates);
            }
          })
  
        }).catch((e) => {
          console.log(e);
        })
  
  
      }).catch((e) => {
        console.log(e);
      })



    });


    
    //const res = await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');


  }


  componentDidMount() {

    // Grab elements, create settings, etc.
    var video = document.getElementById('video');

    // Get access to the camera!
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
        //video.src = window.URL.createObjectURL(stream);
        video.srcObject = stream;
        video.play();

 

      });
    }



  }


  nextQuestion(){
    if ( (this.state.currentQuestion + 1) != this.state.questions.length  ) {
      this.setState({
        currentQuestion: (this.state.currentQuestion + 1),
        countDown: 0
      })
    }
  }

  render() {
    return (
      <div className="container-fluid">

        <Navbar />



        <div className="container mt-5">
          <div className="row">
            <div className="col-sm-8">

              <video className={(this.state.didStart === false || this.state.endOfInterview === true) ? 'hidden-video' : ''} id="video" width={'100%'} height={500} />

            </div>

            <div className="col-sm-4">


              

              {
                this.state.didStart === false ?
                  <section>
                    <h3>Welcome !</h3>

                    <p>
                      1.You will have only 15 minutes to answer to the interview

                    </p>

                    <p>
                      2.You cannot exit from the interview while you&#39;re playing
                    </p>

                    <button className="btn btn-danger  " style={{ marginRight: 25, width: 100 }}>Exit</button>
                    <button className="btn btn-success  " style={{ marginRight: 25, width: 100 }} onClick={() => { this.startTheInterveiw() }} >Continue</button>
                  </section>
                  :
                  <section>
                    {
                      this.state.endOfInterview === false ?
                        <section>
                          <h3>interview Clock :</h3>
                          

                          <div className="clock">
                              <p>
                              
                              {
                                this.state.countDown < 60 ? this.state.countDown+' sec(s)' : (this.state.countDown / 60).toFixed()+' min(s)'
                              } / 15 mins
                            </p>
                          </div>


                          <hr />

                          <p>
                            <strong>
                              Current question :
                            </strong>
                          </p>

                          <p>
                            {this.state.questions[this.state.currentQuestion].question}
                          </p>

                          <button onClick={ ()=>{ this.nextQuestion() } } className="btn btn-primary" >Next question</button>

                        </section> :
                        <section>

                          <h3>Thanks for your time</h3>
                          <p>
                            We will contact in no time, stay tuned.
                          </p>                                


                          <hr/>

                          <ul>
                             {
                               this.state.result.map((e)=>{
                                 return (
                                  <li>
                                    <label> <strong>{e.expression} : {((e.result / this.state.savedFaceStates.length) * 100 ) } %</strong> </label>
                                    <div class="progress">
                                    <div class="progress-bar" role="progressbar" style={ {width: ((e.result / this.state.savedFaceStates.length) * 100 )+'%'  } } aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                  </div>
                                  </li>

                                 );
                               })
                             }
                          </ul>




                        </section>
                    }

                  </section>
              }


            </div>



          </div>
        </div>

      </div>
    );
  }
}

export default App;
