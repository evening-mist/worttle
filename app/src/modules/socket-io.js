import attachSocketIO from '../api/socket-io.js'
 
export default function() {
  this.nuxt.hook('listen', (server) => {
    attachSocketIO(server)
  })
}
