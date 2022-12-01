import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from './examples/obj-file-demo.js';
import {detectLaserCollision, circleIntersect} from "./collision.js";
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Textured_Phong} = defs

const endpoint_scale = 1.5;

class Laser {
    static shapes = {
        cylinder : new defs.Rounded_Capped_Cylinder(100, 100),
    }

    static materials = {
        laser_material : new Material(new defs.Phong_Shader(),
            {ambient: 1, specularity: 1, diffusivity: 1, color: hex_color('#08FF08') })
        };

    constructor(transx,transy,transz,scalex,scaley,scalez,rottheta) {
        this.transx = transx;
        this.transy = transy;
        this.transz = transz;

        this.scalex = scalex;
        this.scaley = scaley;
        this.scalez = scalez;

        this.rottheta = rottheta;

        this.endpoint1_matrix = Mat4.identity();
        this.endpoint2_matrix = Mat4.identity();
        this.light_matrix = Mat4.identity();
    }

    draw(context, program_state, time_between_frames) {
        // align cylinder to the axis we need
        let model_transform = Mat4.rotation(Math.PI / 2, 1, 0 ,0);
        this.light_matrix = Mat4.rotation(Math.PI / 2, 1, 0 ,0);
        this.endpoint1_matrix = Mat4.rotation(Math.PI / 2, 1, 0 ,0);
        this.endpoint2_matrix = Mat4.rotation(Math.PI / 2, 1, 0 ,0);

        // first move the object down so that the top end is at the origin
        model_transform = Mat4.translation(0, -0.5, 0).times(model_transform);
        this.light_matrix = Mat4.translation(0, -this.scaley/(endpoint_scale * 2), 0).times(this.light_matrix);
        this.endpoint1_matrix = Mat4.translation(0, -0.5, 0).times(this.endpoint1_matrix);
        this.endpoint2_matrix = Mat4.translation(0, -this.scaley/endpoint_scale, 0).times(this.endpoint2_matrix);

        // then scale
        model_transform = Mat4.scale(this.scalex, this.scaley, this.scalez).times(model_transform);
        this.light_matrix = Mat4.scale(endpoint_scale, endpoint_scale, endpoint_scale).times(this.light_matrix);
        this.endpoint1_matrix = Mat4.scale(endpoint_scale, endpoint_scale, endpoint_scale).times(this.endpoint1_matrix);
        this.endpoint2_matrix = Mat4.scale(endpoint_scale, endpoint_scale, endpoint_scale).times(this.endpoint2_matrix);

        // then rotate
        model_transform = Mat4.rotation(this.rottheta, 0, 0, 1).times(model_transform);
        this.light_matrix = Mat4.rotation(this.rottheta, 0, 0, 1).times(this.light_matrix);
        this.endpoint1_matrix = Mat4.rotation(this.rottheta, 0, 0, 1).times(this.endpoint1_matrix);
        this.endpoint2_matrix = Mat4.rotation(this.rottheta, 0, 0, 1).times(this.endpoint2_matrix);

        // then move the endpoint to where we want
        model_transform = Mat4.translation(this.transx, this.transy, this.transz).times(model_transform);
        this.light_matrix = Mat4.translation(this.transx, this.transy, this.transz).times(this.light_matrix);
        this.endpoint1_matrix = Mat4.translation(this.transx, this.transy, this.transz).times(this.endpoint1_matrix);
        this.endpoint2_matrix = Mat4.translation(this.transx, this.transy, this.transz).times(this.endpoint2_matrix);

        Laser.shapes.cylinder.draw(context, program_state, model_transform, Laser.materials.laser_material);

        const speed_multiplier = 6; // increase the speed of the objects
        this.transx -= speed_multiplier * time_between_frames;
    }

    getXPos() {
        return this.transx;
    }

    getEndpoints() {
        return [this.endpoint1_matrix, this.endpoint2_matrix];
    }

    getCenter() {
        return this.light_matrix;
    }
}

class Coin {
    static shapes = {
        coin : new defs.Rounded_Capped_Cylinder(100, 100),
    }

    static materials = {
        coin_material : new Material(new defs.Phong_Shader(),
            {ambient: 1, diffusivity: 1, color: hex_color("#dcb82b")}),
    }

    constructor(transx, transy) {
        this.transx = transx;
        this.transy = transy;

    }

    draw(context, program_state, t, time_between_frames) {


        // first flatten along z
        let model_transform = Mat4.scale(1, 1, 0.2);

        // scale radius
        model_transform = Mat4.scale(2, 2, 1).times(model_transform);

        // rotate to give spinning effect
        model_transform = Mat4.rotation(t, 0, 1, 0).times(model_transform);

        // translate to required position
        model_transform = Mat4.translation(this.transx, this.transy, 0).times(model_transform);

        Coin.shapes.coin.draw(context, program_state, model_transform, Coin.materials.coin_material);
        const speed_multiplier = 6; // increase the speed of the objects
        this.transx -= speed_multiplier * time_between_frames;
    }

    getXPos() {
        return this.transx;
    }

    getYPos() {
        return this.transy;
    }

}

export class Jetpacker extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            player : new Shape_From_File("assets/egg.obj"),
            cylinder : new defs.Rounded_Capped_Cylinder(100, 100),
            cylinder2 : new defs.Rounded_Capped_Cylinder(100, 100),
            background1 : new defs.Cube(),
            background2 : new defs.Cube(), 
            background3 : new defs.Cube(),
            ground : new defs.Cube(), 
            sphere1 : new defs.Subdivision_Sphere(4),
            sphere2 : new defs.Subdivision_Sphere(4)
        };

        // *** Materials
        this.materials = {
            player_material: new Material(new defs.Phong_Shader(), {
                color: hex_color("#FFFFFF"),
                ambient: 1, 
                diffusivity: 0.1,
                specularity: 0.1
            }),
            cracked_material : new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, 
                diffusivity: 0.1,
                specularity: 0.1,
                texture: new Texture("assets/cracked.jpg", "NEAREST")
            }),
            ground_material: new Material(new Texture_Scroll_X(0.07), {
                color: hex_color("#000000"),
                ambient: 1, 
                diffusivity: 0.1,
                specularity: 0.1,
                texture: new Texture("assets/ground.jpeg", "LINEAR_MIPMAP_LINEAR")
            }),
            background_material: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1, 
                diffusivity: 1,
                specularity: 0.1,
                texture: new Texture("assets/background.png", "LINEAR_MIPMAP_LINEAR")
            }), 
            endpoint_material : new Material(new defs.Phong_Shader(),
                {ambient: 0.4, specularity:0, diffusivity: 0.4, color: hex_color('#BEBEBE') 
            })      
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 1, 2), vec3(0, 0, 0), vec3(0, 1, 0));

        // player physics
        this.player_matrix = Mat4.scale(3,3,3);
        this.player_y_coord = 0.0;
        this.background_matrix = Mat4.identity();
        this.player_z_coord = 0.0;
        this.w_pressed = false;
        this.player_velocity = 0.0;
        this.jetpack_acceleration = 32.0;
        this.gravity_acceleration = -18.6;
        this.scene_max_y_coord = 38;
        this.scene_min_y_coord = -10;


        // game mechanics
        this.game_over = false;
        this.time_between_frames = 0.04;
        this.time_since_laser_drawn = 0;
        this.max_time_between_laser = this.time_between_frames * 20000; // there must be a laser in these amount of frames
        this.player_radius = 3;
        this.time_since_coin_draw = 0;
        this.max_time_between_coin = this.time_between_frames * 2000;

        this.laser_arr = []; // queue of laser objects
        this.coin_arr = [];
        this.lights = [];

        this.game_paused = false;
        this.hard_mode = false;
        this.collision_detected = false;
        this.change_player_texture = false;

        this.points = 0;
        this.num_coins_collected = 0;

        this.first_laser_drawn = false;

        this.keys_html = document.getElementById('keys');
        this.game_status_html = document.getElementById('game-status');


    }

    make_control_panel() {
        this.control_panel.innerHTML += "Collect coins to earn points and avoid the lasers to protect your egg from cracking! <br>";
        this.new_line();
        this.new_line();
        this.live_string(box => box.textContent = "Points: " + this.points);
        this.new_line();
        this.new_line();

        this.key_triggered_button("Reset", ["r"], () => {
            this.reset();
        })
        this.key_triggered_button("Toggle jetpack", ["h"], () => {
            this.w_pressed = ! this.w_pressed;
        })
        
        this.key_triggered_button("Pause game", ["p"], () => {
            if(!this.game_over) {
                this.game_paused = !this.game_paused;
            }
        })
    
        this.key_triggered_button("Hard mode", ["m"], () => {
            this.hard_mode = !this.hard_mode;
        })
    }

    setLights(program_state) {
        // *** Lights: *** Values of vector or point lights.
        const camera_light = this.initial_camera_location.times(vec4(0,0,0,1));
        program_state.lights = [
            new Light(camera_light, color(1, 0.647, 0, 1), 10000)
        ];

    }

    updatePlayerPosition() {
        let acceleration;

        if (this.w_pressed) {
            acceleration = this.jetpack_acceleration + this.gravity_acceleration;
        } else {
            acceleration = this.gravity_acceleration;
        }
        let delta_y = this.player_velocity * this.time_between_frames + 0.5 * acceleration * (this.time_between_frames ** 2);
        this.player_velocity = this.player_velocity + acceleration * this.time_between_frames;
        this.player_y_coord += delta_y;

        if (this.player_y_coord < this.scene_min_y_coord){
            this.player_y_coord = this.scene_min_y_coord;
            this.player_velocity = 0;
        }
        if (this.player_y_coord > this.scene_max_y_coord) {
            this.player_y_coord = this.scene_max_y_coord
            this.player_velocity = 0;
        }
    }

    drawPlayer(context, program_state) {
        const translation_change = Mat4.translation(0, this.player_y_coord, 0);
        this.player_matrix = translation_change.times(Mat4.scale(3,3,3));
        if (this.change_player_texture) {
            this.shapes.player.draw(context, program_state, this.player_matrix, this.materials.cracked_material);
        }
        else
        {
            this.shapes.player.draw(context, program_state, this.player_matrix, this.materials.player_material);
        }
    }

    collisionDetected() {
        for (let laser of this.laser_arr) {
            const player_z = 0;
            const player_x = 0;

            let collision = detectLaserCollision(vec3(player_x, this.player_y_coord, player_z), this.player_radius, vec3(laser.transx, laser.transy, laser.transz), laser.rottheta, laser.scaley);
            if (collision) {
                return true;
            }
        }
        return false;
    }

    generateLaser(program_state) {

        let draw_new_laser = (this.time_since_laser_drawn / this.max_time_between_laser) > Math.random();

        const entities_start_x = 150; // all entities will be generated at this frame
        const entity_z = 0; // game is 2D

        if (draw_new_laser) {
            this.time_since_laser_drawn = 0;
            const entity_y = Math.random() * (this.scene_max_y_coord - this.scene_min_y_coord) + this.scene_min_y_coord + 7;
            const scale_x = 1;
            const scale_z = 1;
            const scale_y = Math.random() * (30-10) +  10; // scale between 5 and 20 length
            const rottheta = Math.random() * Math.PI / 2; // max rotation should be 90 deg

            let laser = new Laser(entities_start_x, entity_y, entity_z, scale_x, scale_y, scale_z, rottheta);

            this.laser_arr.push(laser);

            // place light at laser midpoint
            this.lights.push(new Light(laser.getCenter().times(vec4(0,0,0,1)), color(1, 1, 1, 1), 1000000));
            program_state.lights.push(new Light(laser.getCenter().times(vec4(0,0,0,1)), color(1, 1, 1, 1), 1000000));
            console.log(this.lights); 

        } else {
            this.time_since_laser_drawn += this.time_between_frames;
        }

    }

    generateCoins() {
        let draw_new_coin = (this.time_since_coin_draw / this.max_time_between_coin) > Math.random();
        const coin_start_x = 150;
        if (draw_new_coin) {
            this.time_since_coin_draw = 0;
            const entity_y = Math.random() * (this.scene_max_y_coord - this.scene_min_y_coord) + this.scene_min_y_coord;
            let coin = new Coin(coin_start_x, entity_y);

            this.coin_arr.push(coin);
        } else {
            this.time_since_coin_draw += this.time_between_frames;
        }
    }

    updateLasers() {
        while (this.laser_arr.length > 0) {
            if (this.laser_arr[0].getXPos() <= -40) {       // let the laser go a little off-screen
                this.laser_arr.splice(0, 1);
                this.lights.splice(1, 1);
            } else {
                break;
            }
        }
    }

    updateCoins() {
        while (this.coin_arr.length > 0) {
            if (this.coin_arr[0].getXPos() <= -40) {
                this.coin_arr.splice(0, 1);
            } else {
                break;
            }
        }
    }

    drawLasers(context, program_state, t) {
        this.laser_arr.forEach((laser, index) => {
            laser.draw(context, program_state, t);

            // draw endpoint spheres
            this.shapes.sphere1.draw(context, program_state, laser.getEndpoints()[0], this.materials.endpoint_material);
            this.shapes.sphere2.draw(context, program_state, laser.getEndpoints()[1], this.materials.endpoint_material);

            // update light position
            this.lights[index] = new Light(laser.getCenter().times(vec4(0,0,0,1)), color(1, 1, 1, 1), 1000000);
            program_state.lights[index + 1] = this.lights[index];
        })
    }

    drawCoins(context, program_state, t, time_between_frames) {
        for(let coin of this.coin_arr) {
            coin.draw(context, program_state, t, time_between_frames);
        }
    }

    detectCoinCollision() {
        let num_coins = 0;
        for (let i = 0; i < this.coin_arr.length; i++){
            const coin = this.coin_arr[i];
            if (circleIntersect(
                vec3(0, this.player_y_coord, 0),
                this.player_radius,
                vec3(coin.getXPos(), coin.getYPos(), 0),
                2
                )){
                // there is an intersect
                num_coins++;
                this.coin_arr.splice(i, 1);
                i--;
            }
        }
        return num_coins;
    }

    updatePoints(num_coins){
        this.points += num_coins;
    }

    reset() {
        this.game_over = false;
        this.collision_detected = false;
        this.change_player_texture = false;
        this.player_y_coord = this.scene_min_y_coord;
        this.w_pressed = false;
        this.player_velocity = 0.0;
        this.game_paused = false;
        this.laser_arr = [];
        this.coin_arr = [];
        this.lights = [];
        this.points = 0;
    }

    updateGamePaused(program_state)
    {
        program_state.animate = !this.game_paused;
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            // this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            this.initial_camera_location = Mat4.translation(-51.63, -18.34, -87.29);
            program_state.set_camera(this.initial_camera_location);
            program_state.game_paused = false;
            this.setLights(program_state);
        }

        this.updateGamePaused(program_state);

        if (this.hard_mode) {
            this.initial_camera_location = Mat4.look_at(vec3(-3, -2.15, 15), vec3(0, 0, 0), vec3(0, 1, 0));
            this.initial_camera_location = this.initial_camera_location.times(Mat4.translation(-21, -5, -57));
        }
        else {
            this.initial_camera_location = Mat4.translation(-51.63, -18.34, -87.29);
        }
        program_state.set_camera(this.initial_camera_location);

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        this.drawPlayer(context, program_state);

        let t = program_state.animation_time / 150;

        let model_transform = Mat4.identity().times(Mat4.translation(13, 22, -15)).times(Mat4.scale(35, 35, 10));
        this.shapes.background1.draw(context, program_state, model_transform, this.materials.background_material);

        model_transform = Mat4.identity().times(Mat4.translation(83, 22, -15)).times(Mat4.scale(35, 35, 10));
        this.shapes.background2.draw(context, program_state, model_transform, this.materials.background_material);

        model_transform = Mat4.identity().times(Mat4.translation(153, 22, -15)).times(Mat4.scale(35, 35, 10));
        this.shapes.background3.draw(context, program_state, model_transform, this.materials.background_material);

        model_transform = Mat4.identity().times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.translation(5, -90, 0)).times(Mat4.scale(150, 75, 50));
        this.shapes.ground.draw(context, program_state, model_transform, this.materials.ground_material);

        if (!this.collisionDetected(context, program_state) && !this.game_paused && !this.game_over) {            
            this.generateLaser(program_state); // see if a laser must be added
            this.generateCoins();
            this.updatePlayerPosition();
            this.updateLasers();
            this.updateCoins();
            let coins_collected = this.detectCoinCollision();
            this.updatePoints(coins_collected);

            this.drawLasers(context, program_state, this.time_between_frames);
            this.drawCoins(context, program_state, t, this.time_between_frames);

        } else if (this.collisionDetected(context, program_state) && !this.collision_detected) {
            // 1st time a collision was detected
            this.game_paused = true;
            program_state.animate = !this.game_paused;

            this.drawLasers(context, program_state, 0);
            this.drawCoins(context, program_state, t, 0)
            this.collision_detected = true;
            this.game_over = true;
            this.change_player_texture = true;
            
        } else {
            this.drawLasers(context, program_state, 0);
            this.drawCoins(context, program_state, t, 0);
        }
    }
}

class Texture_Scroll_X extends Textured_Phong {
    constructor(speed = 0.3) {
        super();
        this.scroll_speed = speed;
    }

    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            const float speed = ` + this.scroll_speed + `;
            
            void main(){
                float translate_factor = mod(2.0 * animation_time, 1000.0);  

                vec2 translated_tex_coord = vec2(f_tex_coord.x + speed*translate_factor, f_tex_coord.y);
                vec4 tex_color = texture2D( texture, translated_tex_coord);
                
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}