import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Jetpacker extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            player : new defs.Subdivision_Sphere(4),
            cylinder : new defs.Rounded_Capped_Cylinder(100, 100),
            cylinder2 : new defs.Rounded_Capped_Cylinder(100, 100)
        };

        // *** Materials
        this.materials = {
            player_material : new Material(new defs.Phong_Shader(),
                {ambient: .6, diffusivity: 1, color: hex_color("#80FFFF")}),
            laser_material : new Material(new defs.Phong_Shader(),
                {ambient: 0.6, color: hex_color("#FFA500")}),
            
        };
        this.accelerate = false;


        this.initial_camera_location = Mat4.look_at(vec3(0, 1, 2), vec3(0, 0, 0), vec3(0, 1, 0));

        this.player_matrix = Mat4.scale(3,3,3);
        this.player_z_coord = 0.0;
        this.w_pressed = false;
        this.player_velocity = 0.0;
        this.jetpack_acceleration = 20.0;
        this.gravity_acceleration = -9.8;
        this.scene_max_z_coord = 40;
        this.scene_min_z_coord = -10;
    }

    make_control_panel() {
        this.key_triggered_button("Toggle jetpack", ["h"], () => {
            this.w_pressed = ! this.w_pressed;
        })
    }

    draw_cylinder(transx,transy,transz,scalex,scaley,scalez,rottheta,context,program_state,t) {
        let model_transform = Mat4.identity().times(Mat4.rotation(rottheta, 1, 0, 0).times(Mat4.scale(scalex, scaley, scalez).times(Mat4.translation(transx, transy, transz))));
        model_transform = Mat4.translation(-t, 0, 0).times(model_transform);
        this.shapes.cylinder.draw(context, program_state, model_transform, this.materials.laser_material);

        let endpoint = model_transform.times(vec4(0,0,0.5,1));
        let length = scaley;  // only valid if scaley == scalez, which it is so far

        // Delete me: Just a test to verify that the endpoint is actually at the endpoint:
        // let endpoint_matrix = Mat4.identity().times(Mat4.translation(endpoint[0],endpoint[1],endpoint[2]).times(Mat4.scale(5,5,5)));
        // this.shapes.player.draw(context, program_state, endpoint_matrix, this.materials.player_material);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(-51.63, -18.34, -87.29));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position1 = vec4(0, 100, 10, 1);
        const light_position2 = vec4(0, -100, -10, 1);
        program_state.lights = [new Light(light_position1, color(1, 1, 1, 1), 1000), new Light(light_position2, color(1, 1, 1, 1), 1000)];
        // program_state.set_camera(this.initial_camera_location);


        const time_between_frames = 0.04;
        let acceleration;

        if (this.w_pressed) {
            acceleration = this.jetpack_acceleration + this.gravity_acceleration;
        } else {
            acceleration = this.gravity_acceleration;
        }
        let delta_z = this.player_velocity * time_between_frames + 0.5 * acceleration * (time_between_frames ** 2);
        this.player_velocity = this.player_velocity + acceleration * time_between_frames;
        this.player_z_coord += delta_z;
        console.log(this.player_z_coord);
        if (this.player_z_coord < this.scene_min_z_coord){
            this.player_z_coord = this.scene_min_z_coord;
            this.player_velocity = 0;
        }
        if (this.player_z_coord > this.scene_max_z_coord) {
            this.player_z_coord = this.scene_max_z_coord
            this.player_velocity = 0;
        }
        let t = program_state.animation_time / 150;


        const translation_change = Mat4.translation(0, this.player_z_coord, 0);
        this.player_matrix = translation_change.times(Mat4.scale(3,3,3));
        this.shapes.player.draw(context, program_state, this.player_matrix, this.materials.player_material);

        this.draw_cylinder(50,0,0,2,2,20,60,context,program_state,t);
        this.draw_cylinder(25,0,0,2,2,20,30,context,program_state,t);
        this.draw_cylinder(150,10,0,2,2,20,20,context,program_state,t);
        this.draw_cylinder(200,20,0,2,2,20,40,context,program_state,t);
        this.draw_cylinder(250,20,0,2,2,20,60,context,program_state,t);
        this.draw_cylinder(300,20,0,2,2,20,70,context,program_state,t);
        this.draw_cylinder(350,20,0,2,2,20,80,context,program_state,t);
        this.draw_cylinder(370,20,0,2,2,20,20,context,program_state,t);
        this.draw_cylinder(400,20,0,2,2,20,30,context,program_state,t);
        this.draw_cylinder(420,20,0,2,2,20,15,context,program_state,t);
    }
}
