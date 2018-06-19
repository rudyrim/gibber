const Gibberish = require( 'gibberish-dsp' )
const serialize = require( 'serialize-javascript' )

const Clock = {
  __beatCount:0,
  id:null,
  nogibberish:true,
  bpm:120,

  store:function() { 
    Gibberish.Clock = this
    this.init()
  },

  init:function() {
    const clockFunc = ()=> {
      Gibberish.processor.port.postMessage({
        address:'clock'
      })
    }

    if( Gibberish.mode === 'worklet' ) {
      this.id = Gibberish.utilities.getUID()

      Gibberish.worklet.port.postMessage({
        address:'add',
        properties:serialize( Clock ),
        id:this.id,
        post: 'store'    
      })
      
      let bpm = 120
      Object.defineProperty( this, 'bpm', {
        get() { return bpm },
        set(v){ 
          bpm = v
          if( Gibberish.mode === 'worklet' ) {
            Gibberish.worklet.port.postMessage({
              address:'set',
              object:this.id,
              name:'bpm',
              value:bpm 
            }) 
          }
        }
      })
    }

    this.seq = Gibberish.Sequencer.make( [ clockFunc ], [ this.time( 1/4 ) ] ).start()

    Gibberish.utilities.workletHandlers.clock = () => {
      this.__beatCount += 1
      this.__beatCount = this.__beatCount % 4 

      // XXX don't use global reference!!!
      if( Gibber.Scheduler !== undefined && Gibberish.mode !== 'processor' ) {
        Gibber.Scheduler.seq( this.__beatCount + 1, 'internal' )
      }
    }
  },

  // time accepts an input value and converts it into samples. the input value
  // may be measured in milliseconds, beats or samples.
  time: function( inputTime = 0 ) {
    let outputTime = inputTime

    // if input is an annotated time value such as what is returned
    // by samples() or ms()...
    if( isNaN( inputTime ) ) {
      if( typeof inputTime === 'object' ) { 
        if( inputTime.type === 'samples' ) {
          outputTime = inputTime.value
        }else if( inputTime.type === 'ms' ) {
          outputTime = this.mstos( inputTime.value ) 
        }
      } 
    }else{
      outputTime = this.btos( inputTime * 4 )
    }
    
    return outputTime
  },

  mstos: function( ms ) {
    return ( ms / 1000 ) * Gibberish.ctx.sampleRate
  },

  // convert beats to samples
  btos: function( beats ) {
    const samplesPerBeat = Gibberish.ctx.sampleRate / (this.bpm / 60 )
    return samplesPerBeat * beats 
  },

  // convert beats to milliseconds
  btoms: function( beats ) {
    const samplesPerMs = Gibberish.ctx.sampleRate / 1000
    return beats * samplesPerMs
  },

  ms: function( value ) {
    return { type:'ms', value }
  },

  samples: function( value ) {
    return { type:'samples', value }
  }
}

module.exports = Clock