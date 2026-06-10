package app.salarybooks;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.*;

public class PdfPickerModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static final int FILE_PICKER_REQUEST = 2025;
    private Promise pickerPromise;

    public PdfPickerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return "PdfPicker";
    }

    @ReactMethod
    public void pickFile(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist");
            return;
        }

        pickerPromise = promise;

        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.setType("*/*"); 
        intent.addCategory(Intent.CATEGORY_OPENABLE);


        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);

        activity.startActivityForResult(intent, FILE_PICKER_REQUEST);
    }

    private WritableMap getFileDetails(Uri uri) {
        WritableMap map = Arguments.createMap();

        Cursor cursor = getReactApplicationContext().getContentResolver()
                .query(uri, null, null, null, null);

        String fileType = getReactApplicationContext().getContentResolver().getType(uri);
        long fileSize = 0;

        try {
            if (cursor != null && cursor.moveToFirst()) {
                int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
                if (sizeIndex != -1) fileSize = cursor.getLong(sizeIndex);
            }
        } finally {
            if (cursor != null) cursor.close();
        }

        map.putString("uri", uri.toString());
        map.putString("type", fileType != null ? fileType : "unknown");
        map.putDouble("size", fileSize);

        return map;
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

        if (requestCode == FILE_PICKER_REQUEST) {
            if (pickerPromise == null) return;

            if (resultCode == Activity.RESULT_OK && data != null) {
                Uri uri = data.getData();


                final int takeFlags = data.getFlags() &
                        (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);

                try {
                    activity.getContentResolver().takePersistableUriPermission(uri, takeFlags);
                } catch (Exception e) {

                }

                WritableMap result = getFileDetails(uri);
                pickerPromise.resolve(result);

            } else {
                pickerPromise.reject("CANCELLED", "User cancelled file picking");
            }

            pickerPromise = null;
        }
    }

    @Override
    public void onNewIntent(Intent intent) { }
}
