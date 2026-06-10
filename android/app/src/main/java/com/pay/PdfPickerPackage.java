package app.salarybooks;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.ReactPackage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PdfPickerPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new PdfPickerModule(reactContext));
        return modules;
    }

    @Override
    public List createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
