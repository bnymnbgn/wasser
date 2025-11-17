package de.trinkwasser.check;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register plugins
        registerPlugin(com.getcapacitor.community.database.sqlite.CapacitorSQLite.class);
        registerPlugin(com.getcapacitor.community.barcodescanner.BarcodeScanner.class);
    }
}
