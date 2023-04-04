let constraints = { video: { facingMode: "user"}, audio: false};
        const cameraView = document.querySelector("#camera--view");
        const cameraOutput = document.querySelector("#camera--output");
        const cameraSensor = document.querySelector("#camera--sensor");
        const cameraTrigger = document.querySelector("#camera--trigger");


        function cameraStart(){
            navigator.mediaDevices.getUserMedia(constraints)
                .then(function(stream){
                    track = stream.getTracks()[0];
                    cameraView.srcObject = stream;

                })
                .catch(function(error){
                    console.error("카메라에 문제가 있습니다.", error);
                })
        }
    
        // 페이지가 로드되면 함수 실행
        window.addEventListener("load", cameraStart, false);

        const ros = new ROSLIB.Ros({ url : 'ws://localhost:9090' });

        // When the Rosbridge server connects, fill the span with id “status" with “successful"
        ros.on('connection', () => {
            document.getElementById("status").innerHTML = "successful";
        });
        
        // When the Rosbridge server experiences an error, fill the “status" span with the returned error
        ros.on('error', (error) => {
            document.getElementById("status").innerHTML = `errored out (${error})`;
        });
        
        // When the Rosbridge server shuts down, fill the “status" span with “closed"
        ros.on('close', () => {
            document.getElementById("status").innerHTML = "waiting";
        });
        
        // Create a listener for /my_topic
        const cmd_vel_listener = new ROSLIB.Topic({
            ros,
            name : "/cmd_vel",
            messageType : "geometry_msgs/Twist"
        });
        
        const sensor_dht11_listener = new ROSLIB.Topic({
            ros,
            name : "/sensor_dht11",
            messageType : "tutorial_interfaces/Dht11"
        });
        const sensor_ultrasonic_listener = new ROSLIB.Topic({
            ros,
            name : "/sensor_ultrasonic",
            messageType : "tutorial_interfaces/Heights"
        });
        var image_listener = new ROSLIB.Topic({
            ros,
            name : '/image',
            messageType : 'sensor_msgs/Image'
        });
        
        // When we receive a message on /my_topic, add its data as a list item to the “messages" ul
        cmd_vel_listener.subscribe((message) => {
            const vel = document.getElementById("velocity");
            vel.innerText = Math.round(parseFloat(document.createTextNode(message.linear.x).data) * 100) / 100;
            const angvel = document.getElementById("angularvel");
            angvel.innerText = Math.round(parseFloat(document.createTextNode(message.angular.z).data) * 100) / 100;
        });
        
        sensor_dht11_listener.subscribe((message) => {
            const temp = document.getElementById("temperature");
            temp.innerText =  Math.round(parseFloat(document.createTextNode(message.temp).data) * 100) / 100;
            const humi = document.getElementById("humidity");
            humi.innerText = Math.round(parseFloat(document.createTextNode(message.humi).data) * 100) / 100;
        });
        sensor_ultrasonic_listener.subscribe((message) => {
            const up = document.getElementById("upheight");
            up.innerText =  Math.round(parseFloat(document.createTextNode(message.upside).data) * 100) / 100;
            const down = document.getElementById("downheight");
            down.innerText = Math.round(parseFloat(document.createTextNode(message.downside).data) * 100) / 100;
        });
        
        
        image_listener.subscribe(function (message) {
            // Convert the ROS message to a canvas image
            var canvas = document.getElementById('camera');
            canvas.width = message.width;
            canvas.height = message.height;
            canvas.src = `data:image/png;${message.encoding},${message.data}`;
          });