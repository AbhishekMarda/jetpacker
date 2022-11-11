import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Jetpacker extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            player : new defs.Subdivision_Sphere(4)
        };

        // *** Materials
        this.materials = {
            player_material : new Material(new defs.Phong_Shader(),
                {ambient: .6, diffusivity: 1, color: hex_color("#80FFFF")}),
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 1, 2), vec3(0, 0, 0), vec3(0, 1, 0));

        this.player_matrix = Mat4.scale(3,3,3);
        this.player_z_coord = 0.0;
        this.w_pressed = false;
        this.player_velocity = 0.0;
        this.jetpack_acceleration = 15.0;
        this.gravity_acceleration = -9.8;
        this.scene_max_z_coord = 50;
        this.scene_min_z_coord = 0;
    }

    make_control_panel() {
        this.key_triggered_button("Toggle jetpack", ["h"], () => {
            this.w_pressed = ! this.w_pressed;
        })
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

        const translation_change = Mat4.translation(0, this.player_z_coord, 0);
        this.player_matrix = translation_change.times(Mat4.scale(3,3,3));
        this.shapes.player.draw(context, program_state, this.player_matrix, this.materials.player_material);
    }
}
