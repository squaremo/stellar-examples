"use strict";
const docker = require("@pulumi/docker");
const k8s = require("@pulumi/kubernetes");

const image = new docker.Image("app-image", {
    build: process.env.APP_DIR,
    imageName: "app",
});

const appLabels = { app: "app" };
const deployment = new k8s.apps.v1.Deployment("app", {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: app, image: image.imageName }] }
        }
    }
});

exports.image = image.imageName;
exports.name = deployment.metadata.name;
