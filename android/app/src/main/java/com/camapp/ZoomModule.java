package com.camapp;// ZoomModule.java
import android.hardware.Camera;
import android.hardware.camera2.CameraManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class ZoomModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactApplicationContext;
    private Camera camera;

    public ZoomModule(ReactApplicationContext reactContext) {
        super(reactContext);
//        cameraManager = reactContext.getNativeModule(CameraManager);
        reactApplicationContext = reactContext;
    }

    @Override
    public String getName() {
        return "CameraZoomModule";
    }


    @ReactMethod
    public void setZoom(float zoomLevel, Promise promise) {
        if (camera != null) {
            Camera.Parameters parameters = camera.getParameters();
            int maxZoom = parameters.getMaxZoom();
            int zoom = (int) (zoomLevel * maxZoom);

            parameters.setZoom(zoom);
            camera.setParameters(parameters);
            promise.resolve(true);
        } else {
            promise.reject("ERROR", "Camera is not available.");
        }
    }
    @ReactMethod
    public void initializeCamera() {
        try {
            if (camera == null) {
                camera = Camera.open();
            }
        } catch (Exception e) {
            camera = null;
        }
    }

}
