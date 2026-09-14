import math
import trimesh

OUT = 'assets/porsche-911-concept.glb'
scene = trimesh.Scene()

def add(mesh, name):
    mesh.metadata['name'] = name
    scene.add_geometry(mesh, node_name=name, geom_name=name)
    return mesh

def ellipsoid(scale, center, name, subdivisions=4):
    m = trimesh.creation.icosphere(subdivisions=subdivisions, radius=1.0)
    m.apply_scale(scale)
    m.apply_translation(center)
    return add(m, name)

def box(extents, center, name):
    m = trimesh.creation.box(extents=extents)
    m.apply_translation(center)
    return add(m, name)

def cylinder(radius, height, center, name, sections=64, axis='z'):
    m = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    if axis == 'x':
        m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2, [0,1,0]))
    elif axis == 'y':
        m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2, [1,0,0]))
    m.apply_translation(center)
    return add(m, name)

ellipsoid((2.38, 0.48, 0.92), (0.0, 0.72, 0.0), 'body_main', 5)
ellipsoid((1.15, 0.30, 0.88), (-1.35, 0.93, 0.0), 'body_hood', 4)
ellipsoid((1.30, 0.38, 0.93), (1.18, 0.91, 0.0), 'body_rear_haunch', 4)
ellipsoid((0.64, 0.44, 0.96), (-1.35, 0.66, 0.0), 'body_front_fenders', 4)
ellipsoid((0.70, 0.50, 0.98), (1.36, 0.72, 0.0), 'body_rear_fenders', 4)
ellipsoid((1.22, 0.60, 0.76), (0.18, 1.25, 0.0), 'glass_cabin', 5)
ellipsoid((1.03, 0.18, 0.79), (0.28, 1.68, 0.0), 'body_roof', 4)
ellipsoid((0.52, 0.055, 0.69), (-0.66, 1.39, 0.0), 'glass_windshield', 4)
ellipsoid((0.50, 0.05, 0.68), (1.05, 1.37, 0.0), 'glass_rear', 4)
ellipsoid((0.13, 0.18, 0.26), (-2.14, 0.93, 0.58), 'light_head_left', 3)
ellipsoid((0.13, 0.18, 0.26), (-2.14, 0.93, -0.58), 'light_head_right', 3)
box((0.08, 0.11, 1.52), (2.17, 0.91, 0.0), 'light_tail_bar')
box((0.12, 0.18, 1.25), (-2.23, 0.47, 0.0), 'trim_front_intake')
box((0.13, 0.19, 1.28), (2.23, 0.46, 0.0), 'trim_rear_diffuser')
box((0.52, 0.055, 1.43), (1.90, 1.19, 0.0), 'body_rear_spoiler')
box((0.08, 0.20, 0.08), (1.72, 1.08, 0.57), 'trim_spoiler_support_left')
box((0.08, 0.20, 0.08), (1.72, 1.08, -0.57), 'trim_spoiler_support_right')
ellipsoid((0.20, 0.10, 0.14), (-0.62, 1.30, 0.95), 'body_mirror_left', 3)
ellipsoid((0.20, 0.10, 0.14), (-0.62, 1.30, -0.95), 'body_mirror_right', 3)

for xi, axle in [(-1.38, 'front'), (1.40, 'rear')]:
    radius = 0.45 if axle == 'front' else 0.47
    for zi, side in [(0.94, 'left'), (-0.94, 'right')]:
        cylinder(radius, 0.30, (xi, 0.47, zi), f'tire_{axle}_{side}', 64)
        cylinder(radius*0.70, 0.315, (xi, 0.47, zi), f'rim_{axle}_{side}', 48)
        cylinder(radius*0.40, 0.325, (xi, 0.47, zi), f'brake_{axle}_{side}', 48)
        cylinder(radius*0.09, 0.34, (xi, 0.47, zi), f'hub_{axle}_{side}', 32)

for zi in (-0.52, -0.33, 0.33, 0.52):
    cylinder(0.055, 0.20, (2.32, 0.40, zi), f'exhaust_{zi:+.2f}', 24, 'x')
box((3.65, 0.08, 1.52), (0.20, 0.37, 0.0), 'trim_underbody')
scene.export(OUT)
print(OUT)
