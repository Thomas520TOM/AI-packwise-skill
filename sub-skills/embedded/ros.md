# ROS/ROS2 Robotics Build Sub-Skill

Build and package robotic applications using ROS (Robot Operating System).

**Current versions**: ROS 2 Jazzy Jalisco (LTS, 2024-2029) / ROS 1 Noetic (EOL 2025) (2025-2026)

## When to Use

- Robot navigation and SLAM
- Manipulator/arm control
- Multi-robot coordination
- Sensor fusion (LiDAR, camera, IMU)
- Autonomous vehicles (research)
- Industrial automation

## ROS 1 vs ROS 2

| Feature | ROS 1 Noetic | ROS 2 Jazzy |
|---------|-------------|-------------|
| Status | EOL May 2025 | Active LTS (2024-2029) |
| Middleware | Custom TCP/UDP | DDS (Data Distribution Service) |
| Real-time | No | Yes (with RT kernel) |
| Security | None built-in | SROS2 (DDS-Security) |
| Multi-robot | Difficult | First-class support |
| Language | C++ / Python 2.7+3 | C++ / Python 3.10+ |
| OS | Ubuntu 20.04 | Ubuntu 24.04 |
| **Recommendation** | Legacy only | **Use ROS 2 for all new projects** |

## ROS 2 Build

### Prerequisites

```bash
# Ubuntu 24.04 (recommended)
sudo apt update && sudo apt install software-properties-common
sudo add-apt-repository universe
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
  -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \
  http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | \
  sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
sudo apt install ros-jazzy-desktop
source /opt/ros/jazzy/setup.bash
```

### Build with colcon

```bash
# Create workspace
mkdir -p ~/ros2_ws/src && cd ~/ros2_ws/src
ros2 pkg create --build-type ament_cmake my_robot

# Build
cd ~/ros2_ws
colcon build --packages-select my_robot
# Output: install/my_robot/

# Source the workspace
source install/setup.bash

# Build with symlink (faster iteration)
colcon build --symlink-install

# Test
colcon test --packages-select my_robot
```

### Package Structure

```
my_robot/
├── CMakeLists.txt          ← Build configuration
├── package.xml             ← Package metadata
├── include/my_robot/       ← Header files
├── src/                    ← C++ source files
│   └── my_node.cpp
├── launch/                 ← Launch files
│   └── bringup.launch.py
├── config/                 ← Parameter files
│   └── params.yaml
├── urdf/                   ← Robot description
│   └── my_robot.urdf
├── meshes/                 ← 3D models
├── worlds/                 ← Gazebo worlds
└── msg/                    ← Custom message types
    └── MyMessage.msg
```

### Launch File (Python)

```python
# launch/bringup.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot',
            executable='my_node',
            name='my_node',
            parameters=[{'param1': 'value1'}],
            output='screen'
        ),
    ])
```

```bash
ros2 launch my_robot bringup.launch.py
```

## Docker Build

```dockerfile
FROM ros:jazzy-ros-base
WORKDIR /ros2_ws
RUN apt-get update && apt-get install -y \
    ros-jazzy-navigation2 \
    ros-jazzy-slam-toolbox \
    && rm -rf /var/lib/apt/lists/*
COPY . src/my_robot/
RUN . /opt/ros/jazzy/setup.sh && colcon build --packages-select my_robot
RUN echo "source /ros2_ws/install/setup.bash" >> ~/.bashrc
CMD ["ros2", "launch", "my_robot", "bringup.launch.py"]
```

## Simulation (Gazebo)

```bash
# Install Gazebo (Harmonic, recommended for ROS 2 Jazzy)
sudo apt install ros-jazzy-gz-sim

# Launch Gazebo with robot
ros2 launch my_robot gazebo.launch.py
```

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| `ros2: command not found` | Source ROS: `source /opt/ros/jazzy/setup.bash` |
| Package not found after build | Source workspace: `source install/setup.bash` |
| DDS discovery issues | Set `ROS_DOMAIN_ID` for network isolation; check firewall |
| Gazebo crash | Check GPU driver; use `LIBGL_ALWAYS_SOFTWARE=1` for headless |
| URDF parsing error | Validate with `check_urdf`; check XML syntax |
| Real-time not working | Use RT kernel (`PREEMPT_RT`); set thread priority with `SCHED_FIFO` |
| Jetson build slow | Cross-compile on x86; use Docker multi-stage build |
| Navigation stack fails | Check map server; verify TF tree with `ros2 run tf2_tools view_frames` |
| Node communication fails | Same `ROS_DOMAIN_ID` on all nodes; check QoS settings |
