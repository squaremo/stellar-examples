"use strict";
const docker = require("@pulumi/docker");
const k8s = require("@pulumi/kubernetes");

const image = new docker.Image("app-image", {
    build: process.env.APP_DIR,
    imageName: "app",
    skipPush: true, // for docker desktop; would need it otherwise
});

const appLabels = { app: "app" };
const deployment = new k8s.apps.v1.Deployment("app", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: 'app', image: image.imageName }] }
        }
    }
});

const service = new k8s.app.v1.Service("app", {
    spec: {
        selector: { matchLabels: appLabels },
        ports: [{
            port: 80,
            targetPort: 80,
        }],
        type: 'LoadBalancer',
    },
});

exports.image = image.imageName;
exports.name = deployment.metadata.name;
exports.externalAddress = service.loadBalancer.apply(status => `http://${status.ingress[0].hostname}:${status.ingress[0].ports[0].port}/`);
