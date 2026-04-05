<?php
$zip = new ZipArchive;
$res = $zip->open('Kenyan School System Management Research.docx');
if ($res === TRUE) {
    if (($index = $zip->locateName('word/document.xml')) !== false) {
        $content = $zip->getFromIndex($index);
        $zip->close();
        
        $content = str_replace('</w:p>', "\n", $content);
        $text = strip_tags($content);
        
        file_put_contents('tmp_research_text.txt', $text);
        echo "Extracted successfully.\n";
    } else {
        echo "word/document.xml not found in archive.\n";
    }
} else {
    echo "Failed to open docx. Error code: " . $res . "\n";
}
