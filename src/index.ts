import Session from "./Session";
import Texture from "./Texture";
import earth from "./img/earth.png";

const c = document.getElementsByTagName("canvas")![0];
const gl = c.getContext("webgl");
const sess = new Session(gl);

Texture.fromURL(gl, earth).then(tex => sess.render(tex));
