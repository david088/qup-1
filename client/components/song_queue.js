import * as React from "react";
import { Text, Image, View, StyleSheet, ScrollView, AsyncStorage, TouchableOpacity, RefreshControl } from "react-native";
import { Button, Icon } from "react-native-elements";
import { getChannelSongsByChannelId } from "../api/songs"
import {styles} from "../style/song_queue_style";

var fixedSongTitle;

export default class SongQueue extends React.Component {

  //this.state.dataSource.cloneWithRows(responseJson.map(item => item.name))
  state = {
    songs: [],
    refreshing: false
  };

  render() {
    return (
        <ScrollView
          // style={styles.container}
          // contentContainerStyle={styles.contentContainer}
          refreshControl = {
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this._onRefresh()}
            />
          }
        >
          <View style={styles.getStartedContainer} >
            {this.state.songs.map((song) => {
              // song title might be too large to fit
              fixedSongTitle = ""
              if (song.song_name.length >= 30) {
                for (var i = 0; i < 30; ++i) {
                  fixedSongTitle += song.song_name[i]
                }
                fixedSongTitle += "..."
              }
              else
                fixedSongTitle = song.song_name

              // make a conditional that if the song's priority is 1, it'll return that song container along with play/pause functionalities
              // and a "now playing" title above it
              if (song.priority === 1) {
                return (
                  <View>
                    <Text style={styles.title}>
                      Now Playing:
                    </Text>

                    <TouchableOpacity
                      style={styles.buttonStyleOnPlaying}
                      activeOpacity={1}>
                      <View style={{ paddingRight: 10, paddingLeft: 10 }}>
                        <Image
                          style={{ width: 50, height: 50 }}
                          source={{ uri: song.album_artwork }}
                        />
                      </View>

                      <Text>
                        <Text style={styles.songTitle}>
                          {fixedSongTitle}
                          {"\n"}
                        </Text>
                        <Text style={{ paddingTop: 30 }}>{song.artist_name}</Text>
                      </Text>
                    </TouchableOpacity>

                    <Text style={{ color: "white", paddingTop: 20, paddingBottom: 3, fontWeight: 'bold', textAlign: "left", paddingLeft: 20, paddingRight: 20, fontSize: 15, }}>
                      Queue:
                    </Text>
                  </View>
                );
              }
              else {
                return (
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    activeOpacity={1}
                  //removed onpress, the pressable icon should be the only thing that will bring up a menu
                  // not the whole entire song container
                  >
                    <View style={{ paddingRight: 10, paddingLeft: 10 }}>
                      <Image
                        style={{ width: 50, height: 50 }}
                        source={{ uri: song.album_artwork }}
                      />
                    </View>

                    <Text style={{width: 235}}>
                      <Text style={styles.songTitle}>
                        {fixedSongTitle}
                        {"\n"}
                      </Text>
                      <Text style={{ paddingTop: 30 }}>{song.artist_name}</Text>
                    </Text>

                    {/*test to make a touchable icon that opens options to features*/}
                    <View style={{paddingTop: 10}}>
                    <Icon
                      name='bars'
                      type='font-awesome'
                      size={30}
                      color="black"
                      iconStyle={alignContext = 'center'} />
                    </View>
                    {/* <Text style={styles.buttonText}>{song.key}</Text> */}
                    {/* <Text style={styles.buttonText}>{song.song_uri}</Text> */}
                    {/* {<Text style={styles.buttonText}>{song.album_artwork}</Text>} */}
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        </ScrollView>
    );
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this._getChannelSongs().then(() => {
      this.setState({refreshing: false});
    });
  }


  _getChannelId = async () => {
    let channel_id = '';
    try {
      channel_id = await AsyncStorage.getItem('channel_id') || 'none';
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
    return channel_id;
  }

  _getChannelSongs = async () => {
    const channel_id = await this._getChannelId();
    const songsJSON = await getChannelSongsByChannelId(channel_id);
    //console.log(songsJSON);
    this.parseSongs(songsJSON);
  }

  parseSongs = responseJSON => {
    this.setState({ songs: [] });
    for (var i = 0; i < responseJSON.length; i++) {
      var track_id = responseJSON[i].id;
      var artist_name = responseJSON[i].artist_name;
      var song_name = responseJSON[i].song_name;
      var song_uri = responseJSON[i].song_uri;
      var album_artwork = responseJSON[i].album_artwork;
      var priority = responseJSON[i].priority;

      var json = JSON.parse(JSON.stringify({
        track_id: track_id,
        artist_name: artist_name,
        song_name: song_name,
        song_uri: song_uri,
        album_artwork: album_artwork,
        priority: priority
      }));
      //console.log(this.state.songs);
      this.setState({ songs: this.state.songs.concat(json) });
    }
    if(this.state.songs.length != 0){
      this.props.action([this.state.songs[0]])
    }
    //console.log(this.state.songs);
  };
}

