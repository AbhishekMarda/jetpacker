import {tiny} from './tiny-graphics.js';
const {
    vec3
} = tiny;

function getBilinearInterpolated2DPoint(start, end, factor){
    if (factor < 0.0 || factor > 1.0) {
        throw Error("factor out of bounds");
    }

    return vec3(start[0] * (1 - factor) + end[0] * factor, start[1] * (1 - factor) + end[1] * factor, 0);
}



function circleIntersect(center1, radius1, center2, radius2) {
    // find distance between the centers
    let distance = Math.sqrt( Math.pow(center1[0] - center2[0], 2) + Math.pow(center1[1] - center2[1], 2));

    return distance < radius1 + radius2;
}

export function detectLaserCollision(player_position, player_radius, laser_start_point, angle, length) {
    // find the end point
    // the z coordinate is useless for us

    let laser_end_point = vec3(Math.cos(angle - Math.PI / 2) * length + laser_start_point[0],
                            Math.sin(angle - Math.PI / 2) * length + laser_start_point[1],
                            0);

    let laser_outline_sphere_radius = 0.3;
    let laser_outline_sphere_interval = laser_outline_sphere_radius * 2 - 0.1; // allow a 0.1 overlap


    for (let curr = 0.0; curr < length; curr += laser_outline_sphere_interval) {
        let curr_center = getBilinearInterpolated2DPoint(laser_start_point, laser_end_point, curr / length);
        if (circleIntersect(player_position, player_radius, curr_center, laser_outline_sphere_radius)) {
            return true;
        }
    }
    return false;
}
