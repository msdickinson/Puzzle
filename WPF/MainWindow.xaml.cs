using Puzzle;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace WPF
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        const int MAX_ROWS = 14;
        const int MAX_COLS = 6;
        Game game;
        DebugText debugText;
        Box[,] Boxs = new Box[MAX_ROWS, MAX_COLS];
        public MainWindow()
        {
            InitializeComponent();
            this.game = new Game(200, true);
            this.debugText = new DebugText(game);
            CreateRectangles();
            Update();
        }

        public void CreateRectangles()
        {
            for (int row = MAX_ROWS - 1; row >= 0; row--)
            {
                for (int col = 0; col < MAX_COLS; col++)
                {

                    var box = new Box(row, col, SwitchRequest);
                    box.Margin = new Thickness(col * 28, ((28 * 13) - (row * 28)), 0.0, 0.0);
                    box.UpdateColor(Colors.Blue);
                    box.Visibility = Visibility.Hidden;
                    box.HorizontalAlignment = HorizontalAlignment.Left;
                    box.VerticalAlignment = VerticalAlignment.Top;
                    Boxs[row, col] = box;
                    grid.Children.Add(Boxs[row, col]);
                }
            }
        }
        private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
        {
            Regex regex = new Regex("[^0-9]+");
            e.Handled = regex.IsMatch(e.Text);
        }
        public void Update()
        {
            UpdateText();
            UpdateRectangles();
        }
        public void UpdateText()
        {
            this.tbxConsole.Text = debugText.Hover() +
                              debugText.Falling() +
                              debugText.BlocksRemoving() +
                              debugText.Swap();
        }
        public void UpdateRectangles()
        {
            for (int row = 0; row < MAX_ROWS; row++)
            {
                for (int col = 0; col < MAX_COLS; col++)
                {
                    if (game.Blocks[row, col].State == BlockState.None ||
                       game.Blocks[row, col].State == BlockState.SwitchNone ||
                       game.Blocks[row, col].State == BlockState.LockedForFall)
                    {
                        Boxs[row, col].Visibility = Visibility.Hidden;
                    }
                    else
                    {
                        Boxs[row, col].Visibility = Visibility.Visible;
                    }

                    switch (game.Blocks[row, col].Color)
                    {
                        case BlockColor.Blue:
                            Boxs[row, col].UpdateColor(Colors.Blue);
                            break;
                        case BlockColor.Green:
                            Boxs[row, col].UpdateColor(Colors.Green);
                            break;
                        case BlockColor.Purple:
                            Boxs[row, col].UpdateColor(Colors.Purple);
                            break;
                        case BlockColor.Red:
                            Boxs[row, col].UpdateColor(Colors.Red);
                            break;
                        case BlockColor.Yellow:
                            Boxs[row, col].UpdateColor(Colors.Yellow);
                            break;
                    }
                }
            }
        }
        public bool SwitchRequest(int row, int col)
        {
            game.RequestSwitch(col, row);
            Update();
            return false;
        }
        private void btnTick_Click(object sender, RoutedEventArgs e)
        {
            int totalTicks = 0;
            if (int.TryParse(txbTick.Text, out totalTicks))
            {
                for (int i = 0; i < totalTicks; i++)
                {
                    game.Tick();
                    if (game.GameOver)
                    {
                        break;
                    }
                }
            }
            Update();
        }

        private void btnReset_Click(object sender, RoutedEventArgs e)
        {
            game.Reset();
            Update();
        }
        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            Puzzle.File.Write(@"C:\Users\mdickinson\Desktop\Learning Projects\Puzzle\Logs", game.log);
            //Update();
        }
    }
}

