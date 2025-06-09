"use client"

import { useState, useCallback } from "react"
import { View, Text, Image, Button, StyleSheet, ActivityIndicator } from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { useFocusEffect } from "@react-navigation/native"
import { useDispatch } from "react-redux"

const UploadPhoto = () => {
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const dispatch = useDispatch()

  useFocusEffect(
    useCallback(() => {
      // Reset state when the screen is focused
      setImage(null)
      setUploading(false)
      setAnalysisResults(null)
      setShowResults(false)
      return () => {
        // Optional: Cleanup function when the screen is unfocused
        // For example, you might want to clear any pending uploads
      }
    }, []),
  )

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    console.log(result)

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image first.")
      return
    }

    setUploading(true)

    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" })
      const imageData = `data:image/jpeg;base64,${base64}` // Assuming JPEG format

      // Replace with your API endpoint
      const apiUrl = "YOUR_API_ENDPOINT"

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      })

      const data = await response.json()
      console.log("Upload successful:", data)

      handleAnalysisComplete(data)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results)
    setShowResults(true)

    // Set automated decisions based on detection results
    const hasCWire = results.terminals?.some((t: any) => t.label?.toUpperCase().includes("C") && t.hasWire)

    const hasJumpers = results.jumpers && results.jumpers.length > 0

    const detectedWires = results.terminals?.filter((t: any) => t.hasWire)?.map((t: any) => t.label) || []

    dispatch({
      type: "SET_AUTOMATED_DECISIONS",
      decisions: {
        hasCWireDetected: hasCWire,
        hasJumpersDetected: hasJumpers,
        detectedWires: detectedWires,
        detectedJumpers: results.jumpers || [],
      },
    })

    // Apply automated flow decisions
    dispatch({ type: "APPLY_AUTOMATED_FLOW" })
  }

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Upload image" onPress={uploadImage} disabled={uploading} />

      {uploading && <ActivityIndicator size="large" color="#0000ff" />}

      {showResults && analysisResults && (
        <View style={styles.resultsContainer}>
          <Text>Analysis Results:</Text>
          <Text>{JSON.stringify(analysisResults, null, 2)}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  resultsContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
})

export default UploadPhoto
