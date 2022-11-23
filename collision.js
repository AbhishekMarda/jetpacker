import {tiny} from './tiny-graphics';
const {
    vec3
} = tiny;

function getBilinearInterpolated2DPoint(start, end, factor){
    if (factor < 0.0 || factor > 1.0) {
        throw Error("factor out of bounds");
    }

    return vec3(start.x * (1 - factor) + end.x * factor, start.y * (1 - factor) + end.y * factor);
}



function circleIntersect(center1, radius1, center2, radius2) {
    // find distance between the centers
    let distance = Math.sqrt( Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2));

    return distance < radius1 + radius2;
}

export function detectLaserCollision(player_position, player_radius, laser_start_point, angle, length) {
    // find the end point
    // the z coordinate is useless for us

    let laser_end_point = vec3(Math.cos(angle) * length + laser_start_point.x,
                            Math.sin(angle) * length + laser_start_point.y,
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
