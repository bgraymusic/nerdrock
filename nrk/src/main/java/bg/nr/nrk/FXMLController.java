package bg.nr.nrk;

import java.awt.Toolkit;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.StringSelection;
import java.io.File;
import java.net.URL;
import java.text.DecimalFormat;
import java.util.*;
import javafx.animation.AnimationTimer;
import javafx.event.ActionEvent;
import javafx.event.Event;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import javafx.stage.FileChooser;

public class FXMLController implements Initializable {

	private enum KeyState { DOWN, UP };

	@FXML private AnchorPane anchorPane;
	@FXML private Button loadButton;
    @FXML private Label fileLabel;
	@FXML private ProgressBar progress;
    @FXML private Label currentTimeLabel;
    @FXML private Label durationLabel;
	@FXML private CheckBox markReleasesCheckbox;
	@FXML private TextField minReleaseMs;
	@FXML private Button playButton;
	@FXML private Button markButton;
	@FXML private Button copyButton;

	private final FileChooser fileChooser = new FileChooser();
	private MediaPlayer player; 
	private Media song;
	private final Collection<Integer> timings = new ArrayList<>();
	private KeyState keyState = KeyState.UP;
	private int minGapMs = 400;
	private int lastReleasedTime = 0;
	private final DecimalFormat hundredths = new DecimalFormat(".##");
	private final Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
	private final AnimationTimer timer = new AnimationTimer() {
		@Override public void handle(long now) {
			double max = player.getTotalDuration().toMillis();
			double pos = player.getCurrentTime().toMillis();
			progress.setProgress(pos / max);
			int minutes = (int)player.getCurrentTime().toMinutes();
			int seconds = (int)player.getCurrentTime().toSeconds();
			currentTimeLabel.setText(String.format("%d:%02d", minutes, (seconds % 60)));
		}
	};

	@Override public void initialize(URL url, ResourceBundle rb) {
		minReleaseMs.setText("400");
		minReleaseMs.textProperty().addListener((observable, oldValue, newValue) -> {
			try {
				minGapMs = Integer.parseInt(newValue);
				System.out.println("Min keyup record time set to " + minGapMs + "ms");
			} catch (NumberFormatException e) {
				System.out.println("Bad input in minReleaseMs TextField: " + minReleaseMs.getText());
			}
		});
		fileChooser.setTitle("Select Audio File");
	}    

	@FXML private void handleLoadAudioButtonAction(ActionEvent event) {
		File file = fileChooser.showOpenDialog(loadButton.getScene().getWindow());
        fileLabel.setText(file.getName());
		song = new Media(file.toURI().toString());
		player = new MediaPlayer(song);
		player.setOnReady(() -> {
			timings.clear();
			currentTimeLabel.setDisable(false);
			currentTimeLabel.setText("0:00");
			durationLabel.setDisable(false);
			int minutes = (int)player.getTotalDuration().toMinutes();
			int seconds = (int)player.getTotalDuration().toSeconds();
			durationLabel.setText(String.format("%d:%02d", minutes, (seconds % 60)));
			progress.setDisable(false);
			progress.setProgress(0.0);
			playButton.setDisable(false);
			markButton.setDisable(true);
			copyButton.setDisable(false);
		});
    }

	@FXML private void playButtonAction(ActionEvent event) {
		if ("Play".equals(playButton.getText())) {
			player.play();
			playButton.setText("Pause");
			markButton.setDisable(false);
			timer.start();
		} else {
			timer.stop();
			player.pause();
			playButton.setText("Play");
			markButton.setDisable(true);
		}
	}

	@FXML private void markReleasesCheckboxClicked(Event event) {
		minReleaseMs.setDisable(!markReleasesCheckbox.isSelected());
		System.out.println(markReleasesCheckbox.isSelected() ? "Marking releases" : "Not marking releases");
	}

	@FXML private void markButtonPressed(Event event) {
		if (player == null || keyState == KeyState.DOWN) return;
		keyState = KeyState.DOWN;
//		System.out.println("Key pressed at " + (int)player.getCurrentTime().toMillis() + "ms");
		int currentTime = (int)player.getCurrentTime().toMillis();
		if (markReleasesCheckbox.isSelected() && (lastReleasedTime > 0) && ((currentTime - lastReleasedTime) > minGapMs)) {
			timings.add(lastReleasedTime);
			lastReleasedTime = 0;
		}
		timings.add(currentTime);
	}

	@FXML private void markButtonReleased(Event event) {
		if (keyState == KeyState.UP) return;
		keyState = KeyState.UP;
//		System.out.println("Key released at " + (int)player.getCurrentTime().toMillis() + "ms");
		lastReleasedTime = (int)player.getCurrentTime().toMillis();
	}

	@FXML private void copyAction(Event event) {
		StringBuilder sb = new StringBuilder();
		sb.append("[0");
		timings.stream().forEach((timing) -> {
			// For some reason, all timings must be earlier to fit the music
			sb.append(", ").append(hundredths.format((timing) / 1000.0));
		});
		if (markReleasesCheckbox.isSelected())
			sb.append(", ").append(hundredths.format((lastReleasedTime) / 1000.0));
		sb.append("]");
		System.out.println("Copying to clipboard: " + sb.toString());
		StringSelection stringSelection = new StringSelection(sb.toString());
		clipboard.setContents(stringSelection, null);
	}

}
