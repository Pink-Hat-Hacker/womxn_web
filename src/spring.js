/**
* Property of: Zoe Valladares
* 
* Code sampled from D. Shiffman and converted to JS
*
* The Nature of Code - Spring 2012
* Box2DProcessing example
* <http://www.shiffman.net/teaching/nature>
* 
* Class to describe the spring joint (displayed as a line)
*/

class Spring {
    MouseJoint mouseJoint;
  
    Spring() {
      mouseJoint = null;
    }
  
    /**
      * If it exists we set its target to the mouse location 
    */
    function update(float x, float y) {
      if (mouseJoint != null) {
        // Always convert to world coordinates!
        Vec2 mouseWorld = box2d.coordPixelsToWorld(x,y);
        mouseJoint.setTarget(mouseWorld);
      }
    }
  
    function display() {
      if (mouseJoint != null) {
        // We can get the two anchor points
        Vec2 v1 = new Vec2(0,0);
        mouseJoint.getAnchorA(v1);
        Vec2 v2 = new Vec2(0,0);
        mouseJoint.getAnchorB(v2);
        // Convert them to screen coordinates
        v1 = box2d.coordWorldToPixels(v1);
        v2 = box2d.coordWorldToPixels(v2);
        // And just draw a line
        stroke(0);
        strokeWeight(1);
        line(v1.x,v1.y,v2.x,v2.y);
      }
    }
  
    /**
      * This is the key function where
      * we attach the spring to an x,y location
      * and the Box object's location
    */
    function bind(float x, float y, Box box) {
      // Define the joint
      MouseJointDef md = new MouseJointDef();
      
      // Body A is just a fake ground body for simplicity (there isn't anything at the mouse)
      md.bodyA = box2d.getGroundBody();
      // Body 2 is the box's boxy
      md.bodyB = box.body;
      // Get the mouse location in world coordinates
      Vec2 mp = box2d.coordPixelsToWorld(x,y);
      // And that's the target
      md.target.set(mp);
      // Some stuff about how strong and bouncy the spring should be
      md.maxForce = 100000.0 * box.body.m_mass;
      md.frequencyHz = 500.0;
      md.dampingRatio = 0.999;
  
      mouseJoint = (MouseJoint) box2d.world.createJoint(md);
    }
  
    function destroy() {
      // We can get rid of the joint when the mouse is released
      if (mouseJoint != null) {
        box2d.world.destroyJoint(mouseJoint);
        mouseJoint = null;
      }
    }
  
  }